import { useState, useEffect } from "react";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import { createEncounter } from "../services/encounterApi";
import {
  getNursingAssessments,
  getNursingDiagnoses,
  getNursingOutcomes,
  getNursingInterventions,
  addNursingAssessmentRecord,
  getNursingAssessmentRecords,
  deleteNursingAssessmentRecord,
  addNursingInterventionEntry,
  deleteNursingInterventionEntry,
} from "../services/nursingApi";

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.15)" : "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
};

const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function Nursing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctor } = useDoctor();

  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const goToNursingHistory = () => {
    if (!patientId) return;
    navigate(`/patients/${patientId}/nursing-history`);
  };

  const [loading, setLoading] = useState(false);
  const [encounterId, setEncounterId] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  /* ============ NEW ASSESSMENT FORM ============ */
  const [assessment, setAssessment] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [outcomeScore, setOutcomeScore] = useState("");

  /* ============ DROPDOWN OPTIONS ============ */
  const [assessmentOptions, setAssessmentOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [outcomeOptions, setOutcomeOptions] = useState([]);
  const [interventionOptions, setInterventionOptions] = useState([]);

  /* ============ SAVED RECORDS (each holds its own interventions) ============ */
  const [records, setRecords] = useState([]);

  // Per-record "add intervention" draft, keyed by assessment record id:
  // { intervention: {value,label}|null, time: "YYYY-MM-DDTHH:mm"|"", note: "" }
  const [drafts, setDrafts] = useState({});
  const [busyRecordId, setBusyRecordId] = useState(null);

  const getEncounterStorageKey = () => `currentEncounter_${patientId}`;

  const getDraft = (recordId) =>
    drafts[recordId] || { intervention: null, time: "", note: "" };

  const updateDraft = (recordId, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [recordId]: { ...getDraft(recordId), ...patch },
    }));
  };

  const ensureEncounterExists = async () => {
    if (encounterId) return encounterId;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (savedEncounterId) {
      const parsedId = Number(savedEncounterId);
      if (!Number.isNaN(parsedId)) {
        setEncounterId(parsedId);
        return parsedId;
      }
    }

    if (!doctor?.id) {
      throw new Error("Doctor information not loaded");
    }

    const res = await createEncounter({
      patientId: Number(patientId),
      doctorId: doctor.id,
    });
    const newEncounterId = res.data.id;

    setEncounterId(newEncounterId);
    sessionStorage.setItem(getEncounterStorageKey(), String(newEncounterId));

    return newEncounterId;
  };

  /* ---------------- Load dropdown options ---------------- */
  const toOptions = (res) =>
    res.data.content.map((item) => ({ value: item.id, label: item.name }));

  const loadAssessmentOptions = async (search = "") => {
    try {
      setAssessmentOptions(toOptions(await getNursingAssessments(search, 0, 20)));
    } catch (error) {
      console.error("Load nursing assessments error:", error?.response?.data || error);
    }
  };

  const loadDiagnosisOptions = async (search = "") => {
    try {
      setDiagnosisOptions(toOptions(await getNursingDiagnoses(search, 0, 20)));
    } catch (error) {
      console.error("Load nursing diagnoses error:", error?.response?.data || error);
    }
  };

  const loadOutcomeOptions = async (search = "") => {
    try {
      setOutcomeOptions(toOptions(await getNursingOutcomes(search, 0, 20)));
    } catch (error) {
      console.error("Load nursing outcomes error:", error?.response?.data || error);
    }
  };

  const loadInterventionOptions = async (search = "") => {
    try {
      setInterventionOptions(toOptions(await getNursingInterventions(search, 0, 20)));
    } catch (error) {
      console.error("Load nursing interventions error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    loadAssessmentOptions();
    loadDiagnosisOptions();
    loadOutcomeOptions();
    loadInterventionOptions();
  }, []);

  /* ---------------- Load existing records ---------------- */
  const loadRecords = async (currentEncounterId) => {
    if (!currentEncounterId) return;
    try {
      const res = await getNursingAssessmentRecords(currentEncounterId);
      setRecords(res.data || []);
    } catch (error) {
      console.error("Load nursing records error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (!savedEncounterId) return;

    const parsedId = Number(savedEncounterId);
    if (Number.isNaN(parsedId)) return;

    setEncounterId(parsedId);
    loadRecords(parsedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const flashSaved = (message) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  /* ---------------- Add assessment record ---------------- */
  const addAssessmentRecord = async () => {
    if (!assessment || !diagnosis) {
      alert("Please select Assessment and Diagnosis");
      return;
    }

    try {
      setLoading(true);
      setSavedMessage("");

      const currentEncounterId = await ensureEncounterExists();

      await addNursingAssessmentRecord({
        encounterId: currentEncounterId,
        assessmentId: assessment.value,
        diagnosisId: diagnosis.value,
        outcomeId: outcome ? outcome.value : null,
        outcomeScore: outcomeScore !== "" ? Number(outcomeScore) : null,
      });

      setAssessment(null);
      setDiagnosis(null);
      setOutcome(null);
      setOutcomeScore("");

      await loadRecords(currentEncounterId);
      flashSaved("Assessment saved. Add interventions below as you perform them.");
    } catch (error) {
      console.error("Add nursing assessment error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to add nursing assessment");
    } finally {
      setLoading(false);
    }
  };

  const removeAssessmentRecord = async (recordId) => {
    if (
      !window.confirm(
        "Remove this assessment and ALL interventions logged under it?"
      )
    ) {
      return;
    }

    try {
      setBusyRecordId(recordId);
      await deleteNursingAssessmentRecord(recordId);
      await loadRecords(encounterId);
    } catch (error) {
      console.error("Delete nursing assessment error:", error?.response?.data || error);
      alert("Failed to remove assessment");
    } finally {
      setBusyRecordId(null);
    }
  };

  /* ---------------- Add / remove intervention under a record ---------------- */
  const addIntervention = async (recordId) => {
    const draft = getDraft(recordId);

    if (!draft.intervention) {
      alert("Please select an intervention");
      return;
    }

    try {
      setBusyRecordId(recordId);

      await addNursingInterventionEntry({
        assessmentRecordId: recordId,
        interventionId: draft.intervention.value,
        // blank = server stamps "now"
        interventionTime: draft.time || null,
        note: draft.note.trim() || null,
      });

      updateDraft(recordId, { intervention: null, time: "", note: "" });

      await loadRecords(encounterId);
      flashSaved("Intervention logged.");
    } catch (error) {
      console.error("Add intervention error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to add intervention");
    } finally {
      setBusyRecordId(null);
    }
  };

  const removeIntervention = async (recordId, interventionEntryId) => {
    try {
      setBusyRecordId(recordId);
      await deleteNursingInterventionEntry(interventionEntryId);
      await loadRecords(encounterId);
    } catch (error) {
      console.error("Delete intervention error:", error?.response?.data || error);
      alert("Failed to remove intervention");
    } finally {
      setBusyRecordId(null);
    }
  };

  /* ================= RENDER ================= */
  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before adding nursing details."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Nursing" />

        <div className="p-8 space-y-8">
          {/* TOP INFO BAR */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Record a nursing assessment, then log each intervention
                  under it as you perform them through your shift.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Encounter ID: {encounterId || "Not created yet"}
                </p>
              </div>

              <button
                onClick={goToNursingHistory}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 shadow-sm transition font-medium"
              >
                Nursing History
              </button>
            </div>
          </div>

          {/* ================= NEW ASSESSMENT ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New Nursing Assessment
                </h2>
                <p className="text-sm text-slate-500">
                  Select the assessment, diagnosis, and outcome once. Then add
                  as many interventions as needed under it.
                </p>
              </div>

              {savedMessage && (
                <span className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                  ✓ {savedMessage}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assessment <span className="text-red-500">*</span>
                </label>
                <Select
                  options={assessmentOptions}
                  value={assessment}
                  onChange={setAssessment}
                  placeholder="Nursing Assessment"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadAssessmentOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <Select
                  options={diagnosisOptions}
                  value={diagnosis}
                  onChange={setDiagnosis}
                  placeholder="Nursing Diagnosis"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadDiagnosisOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Outcome
                </label>
                <Select
                  options={outcomeOptions}
                  value={outcome}
                  onChange={setOutcome}
                  placeholder="Nursing Outcome"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadOutcomeOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Outcome Score
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={outcomeScore}
                  onChange={(e) => setOutcomeScore(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={addAssessmentRecord}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 text-white px-5 py-2.5 font-medium hover:bg-blue-800 shadow transition disabled:opacity-50"
            >
              <span className="text-lg leading-none">+</span>{" "}
              {loading ? "Saving..." : "Add Assessment"}
            </button>
          </section>

          {/* ================= ASSESSMENT CARDS WITH INTERVENTIONS ================= */}
          {records.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
              No nursing assessments yet for this encounter. Add one above to
              start logging interventions.
            </div>
          )}

          {records.map((record) => {
            const draft = getDraft(record.id);
            const busy = busyRecordId === record.id;

            return (
              <section
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Assessment header */}
                <div className="bg-blue-900 text-white px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-blue-200">Assessment: </span>
                      <span className="font-semibold">{record.assessment}</span>
                    </p>
                    <p>
                      <span className="text-blue-200">Diagnosis: </span>
                      <span className="font-semibold">{record.diagnosis}</span>
                    </p>
                    <p>
                      <span className="text-blue-200">Outcome: </span>
                      <span className="font-semibold">
                        {record.outcome || "-"}
                        {record.outcomeScore !== null &&
                        record.outcomeScore !== undefined
                          ? ` (Score: ${record.outcomeScore})`
                          : ""}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => removeAssessmentRecord(record.id)}
                    disabled={busy}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Remove Assessment
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Interventions logged so far */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">
                      Interventions ({record.interventions?.length || 0})
                    </h3>

                    {record.interventions && record.interventions.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-100 text-slate-600">
                            <tr>
                              <th className="px-4 py-2 text-left">Time</th>
                              <th className="px-4 py-2 text-left">Intervention</th>
                              <th className="px-4 py-2 text-left">Note</th>
                              <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {record.interventions.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {formatTime(item.interventionTime)}
                                </td>
                                <td className="px-4 py-2">{item.intervention}</td>
                                <td className="px-4 py-2">{item.note || "-"}</td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() =>
                                      removeIntervention(record.id, item.id)
                                    }
                                    disabled={busy}
                                    className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No interventions logged yet for this assessment.
                      </p>
                    )}
                  </div>

                  {/* Add intervention under THIS assessment */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      Log an intervention
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-4">
                        <Select
                          options={interventionOptions}
                          value={draft.intervention}
                          onChange={(v) => updateDraft(record.id, { intervention: v })}
                          placeholder="Nursing Intervention *"
                          onInputChange={(v, meta) => {
                            if (meta.action === "input-change")
                              loadInterventionOptions(v);
                          }}
                          isSearchable
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={selectStyles}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <input
                          type="datetime-local"
                          value={draft.time}
                          onChange={(e) =>
                            updateDraft(record.id, { time: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Leave blank to use the current time.
                        </p>
                      </div>

                      <div className="md:col-span-3">
                        <input
                          value={draft.note}
                          onChange={(e) =>
                            updateDraft(record.id, { note: e.target.value })
                          }
                          placeholder="Note (optional)"
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button
                          onClick={() => addIntervention(record.id)}
                          disabled={busy}
                          className="w-full rounded-xl bg-blue-900 text-white px-4 py-2.5 hover:bg-blue-800 shadow disabled:opacity-50"
                        >
                          {busy ? "Saving..." : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
