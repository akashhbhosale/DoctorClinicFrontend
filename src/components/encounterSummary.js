import {
  getEncounterVitals, getEncounterLaboratory, getEncounterRadiology, getEncounterObservation,
} from "../services/assessmentApi";
import { getNursingAssessmentRecords } from "../services/nursingApi";

export async function loadEncounterSummary(id) {
  const [vitals, labs, radiology, observations, nursing] = await Promise.all([
    getEncounterVitals(id).catch(error => {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }),
    getEncounterLaboratory(id), getEncounterRadiology(id), getEncounterObservation(id),
    getNursingAssessmentRecords(id),
  ]);
  return { vitals: vitals.data, labs: labs.data, radiology: radiology.data,
    observations: observations.data, nursing: nursing.data };
}

export function encounterSections(visit, summary, block, fields) {
  function rows(label, items, describe) {
    block(label, items?.length ? items.map(describe).join("\n") : "No entries recorded.");
  }
  rows("Chief complaint", visit.complaints, item => fields([
    ["Complaint", item.complaint], ["Duration (days)", item.timeSinceDays],
  ]));
  const v = summary.vitals;
  block("Vitals", v && fields([
    ["Systolic BP (mmHg)", v.systolicBp], ["Diastolic BP (mmHg)", v.diastolicBp],
    ["Pulse (/min)", v.pulseRate], ["Respirations (/min)", v.respiratoryRate],
    ["SpO₂ (%)", v.spo2], ["Height (cm)", v.height], ["Weight (kg)", v.weight],
    ["Temperature", v.temperature], ["Temperature unit", v.tempUnit],
  ]) || "No vitals recorded.");
  rows("Diagnosis", visit.diagnoses, d => fields([
    ["Diagnosis", d.description], ["Code", d.code], ["Type", d.diagnosisType],
  ]));
  if (visit.procedures?.length) rows("Procedures", visit.procedures, p => fields([
    ["Procedure", p.procedureName], ["Site", p.site], ["Method", p.method],
    ["Device", p.device], ["Laterality", p.laterality], ["Priority", p.priority],
  ]));
  if (visit.notes) block("Encounter notes", visit.notes);
  const attachments = item => item.files?.map(f => f.originalFileName).join(", ");
  if (summary.labs.length) rows("Laboratory", summary.labs, item => fields([
    ["Test", item.testName], ["Result", item.labResult], ["Files", attachments(item)],
  ]));
  if (summary.radiology.length) rows("Radiology", summary.radiology, item => fields([
    ["Order", item.orderName], ["Result", item.radiologyResult], ["Files", attachments(item)],
  ]));
  if (summary.observations.length) rows("Observations", summary.observations, item => fields([
    ["Observation", item.observationName], ["Result", item.assessmentResult],
  ]));
}

export function nursingSections(records, block, fields) {
  if (!records.length) block("Nursing care plan", "No care plan recorded.");
  records.forEach((r, index) => {
    block("Nursing care plan " + (index + 1), fields([
      ["Assessment", r.assessment], ["Nursing diagnosis", r.diagnosis],
      ["Outcome", r.outcome], ["Outcome score", r.outcomeScore],
    ]));
    for (const entry of r.interventions || []) {
      block("Care plan " + (index + 1) + " — Intervention", fields([
        ["Intervention", entry.intervention], ["Time", entry.interventionTime?.replace("T", " ")],
        ["Note", entry.note],
      ]));
    }
  });
}
