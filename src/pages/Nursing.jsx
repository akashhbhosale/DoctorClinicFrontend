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
  addEncounterNursing,
  getEncounterNursing,
  deleteEncounterNursing,
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
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
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

  // Shows a clear "Saved" confirmation after each Add, since nursing rows
  // save immediately (no separate "Save Encounter" step, unlike the
  // notes field on the Encounter page).
  const [savedMessage, setSavedMessage] = useState("");

  /* ================= FORM STATE ================= */
  const [assessment, setAssessment] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [outcomeScore, setOutcomeScore] = useState("");
  const [intervention, setIntervention] = useState(null);

  /* ================= DROPDOWN OPTIONS ================= */
  const [assessmentOptions, setAssessmentOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [outcomeOptions, setOutcomeOptions] = useState([]);
  const [interventionOptions, setInterventionOptions] = useState([]);

  /* ================= SAVED RECORDS ================= */
  const [nursingRecords, setNursingRecords] = useState([]);

  const getEncounterStorageKey = () => `currentEncounter_${patientId}`;

  /* ---------------- Ensure encounter exists (same pattern as Assessment.jsx / Encounter.jsx) ---------------- */
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

    const payload = {
      patientId: Number(patientId),
      doctorId: doctor.id,
    };

    const res = await createEncounter(payload);
    const newEncounterId = res.data.id;

    setEncounterId(newEncounterId);
    sessionStorage.setItem(getEncounterStorageKey(), String(newEncounterId));

    return newEncounterId;
  };

  /* ---------------- Load dropdown options (search-as-you-type) ---------------- */
  const loadAssessmentOptions = async (search = "") => {
    try {
      const res = await getNursingAssessments(search, 0, 20);
      setAssessmentOptions(
        res.data.content.map((item) => ({ value: item.id, label: item.name }))
      );
    } catch (error) {
      console.error("Load nursing assessments error:", error?.response?.data || error);
    }
  };

  const loadDiagnosisOptions = async (search = "") => {
    try {
      const res = await getNursingDiagnoses(search, 0, 20);
      setDiagnosisOptions(
        res.data.content.map((item) => ({ value: item.id, label: item.name }))
      );
    } catch (error) {
      console.error("Load nursing diagnoses error:", error?.response?.data || error);
    }
  };

  const loadOutcomeOptions = async (search = "") => {
    try {
      const res = await getNursingOutcomes(search, 0, 20);
      setOutcomeOptions(
        res.data.content.map((item) => ({ value: item.id, label: item.name }))
      );
    } catch (error) {
      console.error("Load nursing outcomes error:", error?.response?.data || error);
    }
  };

  const loadInterventionOptions = async (search = "") => {
    try {
      const res = await getNursingInterventions(search, 0, 20);
      setInterventionOptions(
        res.data.content.map((item) => ({ value: item.id, label: item.name }))
      );
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

  /* ---------------- Load existing nursing records for this encounter ---------------- */
  const loadNursingRecords = async (currentEncounterId) => {
    if (!currentEncounterId) return;
    try {
      const res = await getEncounterNursing(currentEncounterId);
      setNursingRecords(res.data || []);
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
    loadNursingRecords(parsedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  /* ---------------- Add (saves immediately) ---------------- */
  const addNursingRecord = async () => {
    if (!assessment || !diagnosis || !intervention) {
      alert("Please select Assessment, Diagnosis, and Intervention");
      return;
    }

    try {
      setLoading(true);
      setSavedMessage("");

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        assessmentId: assessment.value,
        diagnosisId: diagnosis.value,
        outcomeId: outcome ? outcome.value : null,
        outcomeScore: outcomeScore !== "" ? Number(outcomeScore) : null,
        interventionId: intervention.value,
      };

      await addEncounterNursing(payload);

      // reset form
      setAssessment(null);
      setDiagnosis(null);
      setOutcome(null);
      setOutcomeScore("");
      setIntervention(null);

      await loadNursingRecords(currentEncounterId);

      // Clear confirmation so it's unmistakable this row is already saved —
      // no separate "Save" button exists for nursing entries.
      setSavedMessage("Saved to this encounter.");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Add nursing record error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        "Failed to add nursing record";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Remove ---------------- */
  const removeRecord = async (recordId) => {
    try {
      setLoading(true);
      await deleteEncounterNursing(recordId);
      await loadNursingRecords(encounterId);
    } catch (error) {
      console.error("Delete nursing record error:", error?.response?.data || error);
    } finally {
      setLoading(false);
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
          {/* TOP INFO BAR — same pattern as Assessment.jsx / Encounter.jsx */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Nursing page for the current encounter.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Encounter ID: {encounterId || "Not created yet"}
                </p>
              </div>

              <button
                onClick={goToNursingHistory}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition font-medium"
              >
                Nursing History
              </button>
            </div>
          </div>

          {/* NURSING DETAILS SECTION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Nursing Details
                </h2>
                <p className="text-sm text-slate-500">
                  Select assessment, diagnosis, outcome, and intervention, then
                  click Add. Each entry saves immediately — there's no separate
                  save step. Multiple interventions can be added for this
                  encounter.
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
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadAssessmentOptions(inputValue);
                    }
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
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadDiagnosisOptions(inputValue);
                    }
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
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadOutcomeOptions(inputValue);
                    }
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

              <div className="md:col-span-9">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intervention <span className="text-red-500">*</span>
                </label>
                <Select
                  options={interventionOptions}
                  value={intervention}
                  onChange={setIntervention}
                  placeholder="Nursing Intervention"
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadInterventionOptions(inputValue);
                    }
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={addNursingRecord}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 text-white px-6 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                >
                  {loading ? "Saving..." : "+ Add"}
                </button>
              </div>
            </div>

            {nursingRecords.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Assessment</th>
                      <th className="px-4 py-3 text-left">Diagnosis</th>
                      <th className="px-4 py-3 text-left">Outcome</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Intervention</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {nursingRecords.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.assessment}</td>
                        <td className="px-4 py-3">{item.diagnosis}</td>
                        <td className="px-4 py-3">{item.outcome || "-"}</td>
                        <td className="px-4 py-3">{item.outcomeScore ?? "-"}</td>
                        <td className="px-4 py-3">{item.intervention}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeRecord(item.id)}
                            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
