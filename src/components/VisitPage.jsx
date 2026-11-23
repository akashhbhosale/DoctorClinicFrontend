import { createElement, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PatientSelectionRequired from "./PatientSelectionRequired";
import StartEncounterRequired from "./StartEncounterRequired";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import { activeVisit, startVisit } from "../services/encounterApi";

export default function VisitPage({ page, patientPage = false }) {
  const { activePatient } = usePatient();
  const { doctor } = useDoctor();
  const { id, encounterId } = useParams();
  if (!activePatient?.id || (id && String(activePatient.id) !== id)) return <PatientSelectionRequired />;
  return <OpenVisit key={[doctor?.id, activePatient.id, encounterId, page.name].join("/")}
    patient={activePatient} doctorId={doctor?.id} requested={encounterId} page={page} patientPage={patientPage} />;
}

function OpenVisit({ patient, doctorId, requested, page, patientPage }) {
  const [id, setId] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [attempt, retry] = useState(0);
  const starting = useRef(false);

  useEffect(() => {
    if (!doctorId) return;
    let current = true;
    activeVisit(patient.id)
      .then(({ data }) => { if (current) setId(data.id); })
      .catch(() => { if (current) setError("Could not load the active encounter."); })
      .finally(() => { if (current) setBusy(false); });
    return () => { current = false; };
  }, [doctorId, patient.id, attempt]);

  async function start() {
    if (starting.current || busy || id != null) return;
    starting.current = true;
    setBusy(true);
    try {
      setId((await startVisit(patient.id)).data.id);
    } catch {
      setError("Could not confirm the new encounter. Retry to check its status.");
    } finally {
      starting.current = false;
      setBusy(false);
    }
  }

  const mismatch = requested && String(id) !== requested;
  let status = "Start an encounter or review this patient’s previous visits.";
  if (!doctorId) status = "Waiting for the signed-in doctor.";
  else if (busy) status = "Checking encounter…";
  else if (error) status = error;
  else if (mismatch) status = "Open the requested visit from Encounter History.";
  else if (id != null) status = `Encounter #${id} is open. Complete it on Nursing before starting another.`;

  return (
    <>
      <StartEncounterRequired patient={patient} encounterId={id} onStart={start}
        disabled={busy || !!error || !!mismatch} status={status} />
      {error && <button type="button" className="mx-6 mt-2 underline" onClick={() => {
        setError("");
        setBusy(true);
        retry(n => n + 1);
      }}>Retry encounter lookup</button>}
      {(patientPage || (!busy && !error && !mismatch && id != null)) &&
        createElement(page, { encounterId: id })}
    </>
  );
}
