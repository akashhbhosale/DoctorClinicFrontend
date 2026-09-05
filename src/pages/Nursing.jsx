import { useState, useEffect } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";

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
  const { doctor } = useDoctor();

  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [loading, setLoading] = useState(false);
  const [encounterId, setEncounterId] = useState(null);

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

  /* ---------------- Ensure encounter exists (same pattern as Assessment.jsx) ---------------- */
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
    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (savedEncounterId) {
      const parsedId = Number(savedEncounterId);
      if (!Number.isNaN(parsedId)) {
        setEncounterId(parsedId);
        loadNursingRecords(parsedId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  /* ---------------- Add ---------------- */
  const addNursingRecord = async () => {
    if (!assessment || !diagnosis || !intervention) {
      alert("Please select Assessment, Diagnosis, and Intervention");
      return;
    }

    try {
      setLoading(true);

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
      <div className="p-6">
        <PatientSelectionRequired />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader title="Nursing" />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Nursing Details
            </h2>
            <p className="text-sm text-slate-500">
              Add nursing assessment, diagnosis, outcome, and intervention. Multiple
              interventions can be added for this encounter.
            </p>
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
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
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

            <div className="md:col-span-3 flex items-end h-full">
              <button
                onClick={addNursingRecord}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white px-6 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
              >
                + Add
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
  );
}
