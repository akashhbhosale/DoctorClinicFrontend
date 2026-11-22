import { encounterSections, nursingSections } from "./encounterSummary";

// Render directly into the preview frame. The browser prints these same sheets.
export async function renderPrescription(doc, record, paper) {
  const { patient, doctor, visit, medicines, surgeries, followUp } = record;
  doc.documentElement.lang = "en";
  doc.title = record.summary ? "Encounter Summary" : "Prescription";
  doc.head.replaceChildren();
  doc.body.replaceChildren();
  const style = doc.createElement("style");
  style.textContent = `
    @page { size: A4 portrait; margin: 0 }
    * { box-sizing: border-box }
    body { margin: 0; background: #e2e8f0; font: 11pt/1.45 Arial,sans-serif; color: #17212c }
    article { position: relative; width: 210mm; height: 297mm; margin: 8px auto;
      background: white; break-after: page; padding: ${paper.top}mm 15mm ${paper.bottom}mm }
    article:last-child { break-after: auto }
    img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill }
    main { position: relative; height: 100%; display: flow-root; overflow-wrap: anywhere }
    section { padding: 2mm 0; white-space: pre-wrap; border-bottom: 1px solid #d4dbe1 }
    strong { display: block; font-size: 12pt }
    h1 { font-size: 16pt; margin: 0 0 2mm }
    @media print { body { background: white } article { margin: 0 } }
  `;
  doc.head.append(style);
  let area;
  function newSheet() {
    const page = doc.createElement("article");
    if (paper.image) {
      const image = doc.createElement("img");
      image.src = paper.image;
      image.alt = "";
      page.append(image);
    }
    area = doc.createElement("main");
    page.append(area);
    doc.body.append(page);
    const title = doc.createElement("h1");
    title.textContent = doc.body.children.length === 1 ? doc.title : doc.title + " continued — " + patient.fullName + " (#" + visit.encounterId + ")";
    area.append(title);
  }
  newSheet();
  const fields = pairs => pairs.filter(([,v]) => v !== null && v !== undefined && v !== "")
    .map(([label,value]) => label + ": " + value).join("   •   ");
  function block(label, detail) {
    const section = doc.createElement("section");
    const heading = doc.createElement("strong");
    heading.textContent = label;
    const body = doc.createTextNode(detail || "");
    section.append(heading, body);
    area.append(section);
    if (area.scrollHeight <= area.clientHeight) return;
    section.remove();
    if (area.children.length > 1) newSheet();
    area.append(section);
    // Split exceptionally long notes across sheets without discarding text.
    while (area.scrollHeight > area.clientHeight) {
      const chars = Array.from(body.data);
      let low = 0, high = chars.length;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        body.data = chars.slice(0, mid).join("");
        if (area.scrollHeight <= area.clientHeight) low = mid;
        else high = mid - 1;
      }
      if (!low) throw new Error("This entry needs more writing space. Reduce the paper margins.");
      // Keep words together when the current page has a natural break.
      let split = low;
      while (split > 0 && !/\s/.test(chars[split - 1])) split--;
      if (split > 0) low = split;
      body.data = chars.slice(0, low).join("");
      newSheet();
      return block(label.endsWith(" (continued)") ? label : label + " (continued)", chars.slice(low).join(""));
    }
  }
  block("Doctor — " + doctor.fullName, fields([["Qualification",doctor.qualification],["Speciality",doctor.speciality],["Registration",doctor.registrationNo],["Phone",doctor.phoneNo],["Email",doctor.email]]));
  block("Patient — " + patient.fullName, fields([["Patient ID",patient.id],["Registration",patient.registrationNo],["ABHA",patient.abhaId],["Age",patient.age],["Sex",patient.gender],["DOB",patient.dateOfBirth],["Blood group",patient.bloodGroup],["Phone",patient.phoneNo],["Email",patient.email],["Occupation",patient.occupation],["Address",patient.address]]));
  block("Visit", fields([["Encounter",visit.encounterId],["Date",visit.encounterDate?.split("T")[0]]]));
  if (record.summary) encounterSections(visit, record.summary, block, fields);
  medicines.forEach((m,i) => block("Rx " + (i+1) + ". " + m.medicineName, fields([["Form",m.doseForm],["Dose",m.dosage],["Route",m.routeOfAdministration],["Directions",m.directionOfUse],["Duration",m.durationDays == null ? null : m.durationDays + " days"],["Instructions",m.comment]])));
  if (!medicines.length) block("Medication", "No medications prescribed.");
  surgeries.forEach(s => block("Surgical treatment — " + s.surgeryName, fields([["Laterality",s.laterality],["Site",s.site],["Method",s.method],["Device",s.device]])));
  if (followUp?.followUpDate || followUp?.followUpInstructions)
    block("Follow-up", [followUp.followUpDate,followUp.followUpInstructions].filter(Boolean).join(" — "));
  if (record.summary) nursingSections(record.summary.nursing, block, fields);
  await Promise.all(Array.from(doc.images, image => image.decode()));
}
