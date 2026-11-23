import { useEffect, useRef, useState } from "react";
import { visitSummary, getEncounterDetails } from "../services/encounterApi";
import { getEncounterMedication, getEncounterSurgicalTreatment, getEncounterFollowUp } from "../services/medicationApi";
import { renderPrescription } from "./prescriptionDocument";


import { readPdfPaper } from "./readPdfPaper";

const defaultPaper = { image: "", top: 18, bottom: 18 };
const validMargin = n => Number.isInteger(n) && n >= 5 && n <= 80;

function savedPaper(key) {
  try {
    const p = JSON.parse(localStorage.getItem(key));
    if (p && validMargin(p.top) && validMargin(p.bottom) &&
      (p.image === "" || /^data:image\/(png|jpeg);base64,/.test(p.image))) return p;
  } catch { /* Use the built-in paper when browser storage is unavailable. */ }
  return defaultPaper;
}

async function readPaper(file, allowPdf) {
  if (file.size > 2 * 1024 * 1024) throw new Error("Choose a template up to 2 MB.");
  const bytes = new Uint8Array(await file.slice(0,8).arrayBuffer());
  if (allowPdf && new TextDecoder().decode(bytes).startsWith("%PDF-")) return readPdfPaper(file);
  const png = [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!png && !jpeg) throw new Error("Choose a PNG or JPEG image of your blank case paper.");
  const reader = new FileReader();
  const image = await new Promise((resolve,reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(new Blob([file], {type: png ? "image/png" : "image/jpeg"}));
  });
  const test = new Image();
  test.src = image;
  await test.decode();
  return image;
}

export default function PrescriptionPaper({ encounterId, patient, doctor, onClose, summary = false }) {
  const dialog = useRef(null);
  const frame = useRef(null);
  const key = "casePaper.v1." + doctor.id;
  const [paper,setPaper] = useState(() => savedPaper(key));
  const [record,setRecord] = useState(null);
  const [ready,setReady] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [notice,setNotice] = useState("");
  const [error,setError] = useState("");
  const [attempt,retry] = useState(0);

  useEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    return () => modal.close();
  }, []);

  useEffect(() => {
    let current = true;
    setError("");
    setRecord(null);
    setReady(false);
    frame.current?.contentDocument?.body.replaceChildren();
    const load = summary ? visitSummary(encounterId).then(r => r.data) : Promise.all([getEncounterDetails(encounterId), getEncounterMedication(encounterId),
      getEncounterSurgicalTreatment(encounterId), getEncounterFollowUp(encounterId)])
      .then(([details, medication, surgery, follow]) => ({
        visit: details.data, patient, doctor, medicines: medication.data, surgeries: surgery.data, followUp: follow.data,
      }));
    load.then(data => {
        if (!current) return;
        if (String(data.visit.patientId) !== String(patient.id) || String(data.visit.doctorId) !== String(doctor.id) ||
            String(data.visit.encounterId) !== String(encounterId)) throw new Error("Visit does not match this patient and doctor.");
        setRecord(data);
      }).catch(e => current && setError(e.response ? "Unable to load the saved encounter data. Try again." : e.message));
    return () => { current = false; };
  }, [encounterId,patient,doctor,attempt,summary]);

  useEffect(() => {
    if (!record) return;
    let current = true;
    setReady(false);
    renderPrescription(frame.current.contentDocument, record, paper)
      .then(() => current && setReady(true))
      .catch(() => current && setNotice("Preview could not be prepared. Reset the paper or adjust its margins."));
    return () => { current = false; };
  }, [record,paper]);

  function updatePaper(next) {
    setReady(false);
    setPaper(next);
    setNotice("");
    try { localStorage.setItem(key,JSON.stringify(next)); }
    catch { setNotice("This paper is available for this preview. Browser storage could not save it for later."); }
  }
  async function upload(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try { updatePaper({...paper, image: await readPaper(file, summary)}); }
    catch (e) { setNotice(e.message || "This image cannot be opened."); }
    finally { setUploading(false); }
  }

  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="paper-title"
    className="m-auto w-[95vw] max-w-5xl max-h-[95vh] overflow-auto rounded-xl p-4 backdrop:bg-black/50">
    <div className="flex items-center justify-between gap-3">
      <h2 id="paper-title" className="text-xl font-bold">{summary ? "Encounter Summary" : "Prescription paper"}</h2>
      <button onClick={onClose}>Close</button>
    </div>
    <fieldset disabled={uploading} className="my-3 flex flex-wrap items-end gap-4 text-sm">
      <label>Upload blank A4 case paper ({summary ? "PNG, JPEG or PDF page 1" : "PNG or JPEG"}, up to 2 MB)
        <input type="file" accept={summary ? "image/png,image/jpeg,application/pdf" : "image/png,image/jpeg"} onChange={upload} className="block" />
      </label>
      {["top","bottom"].map(edge => <label key={edge} className="capitalize">{edge} margin (mm)
        <select value={paper[edge]} className="ml-2 border" onChange={e => updatePaper({...paper,[edge]:Number(e.target.value)})}>
          {Array.from({length:76},(_,i) => i+5).map(n => <option key={n}>{n}</option>)}
        </select>
      </label>)}
      <button className="underline" onClick={() => updatePaper({...defaultPaper})}>Reset paper</button>
    </fieldset>
    {notice && <p role="status">{notice}</p>}
    {error ? <p role="alert">{error} <button className="underline" onClick={() => retry(n => n+1)}>Retry</button></p>
      : !record && <p role="status">Loading saved encounter…</p>}
    <iframe title={summary ? "A4 encounter summary preview" : "A4 prescription preview"} ref={frame} className="w-full h-[60vh] border bg-white" />
    <button disabled={!record || !ready || uploading || !!error} className="mt-3 bg-blue-900 text-white rounded-lg px-6 py-2 disabled:opacity-50"
      onClick={() => { frame.current.contentWindow.focus(); frame.current.contentWindow.print(); }}>{summary ? "Print encounter summary" : "Print prescription"}</button>
  </dialog>;
}
