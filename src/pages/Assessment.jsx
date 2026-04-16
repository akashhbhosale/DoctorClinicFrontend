import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import { createEncounter } from "../services/encounterApi";
import {
  getEncounterVitals,
  saveEncounterVitals,
} from "../services/assessmentApi";

export default function Assessment() {
  const { id } = useParams();
  const { doctor } = useDoctor();

  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [loading, setLoading] = useState(false);
  const [encounterId, setEncounterId] = useState(null);

  /* ================= VITALS ================= */
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    respiratory: "",
    spo2: "",
    height: "",
    weight: "",
    temperature: "",
    tempUnit: "C",
  });

  /* ================= LAB ================= */
  const [labOrder, setLabOrder] = useState("");
  const [labResult, setLabResult] = useState("");
  const [labs, setLabs] = useState([]);

  /* ================= RADIOLOGY ================= */
  const [radiologyOrder, setRadiologyOrder] = useState("");
  const [radiologyResult, setRadiologyResult] = useState("");
  const [radiology, setRadiology] = useState([]);

  /* ================= ASSESSMENT ================= */
  const [observation, setObservation] = useState("");
  const [assessmentResult, setAssessmentResult] = useState("");
  const [assessments, setAssessments] = useState([]);

  const getEncounterStorageKey = () => `currentEncounter_${patientId}`;

  const resetVitalsForm = () => {
    setVitals({
      systolic: "",
      diastolic: "",
      pulse: "",
      respiratory: "",
      spo2: "",
      height: "",
      weight: "",
      temperature: "",
      tempUnit: "C",
    });
  };

  const mapVitalsResponseToState = (data) => {
    setVitals({
      systolic: data?.systolicBp?.toString() || "",
      diastolic: data?.diastolicBp?.toString() || "",
      pulse: data?.pulseRate?.toString() || "",
      respiratory: data?.respiratoryRate?.toString() || "",
      spo2: data?.spo2?.toString() || "",
      height: data?.height?.toString() || "",
      weight: data?.weight?.toString() || "",
      temperature: data?.temperature?.toString() || "",
      tempUnit: data?.tempUnit || "C",
    });
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

  const loadVitals = async (currentEncounterId) => {
    if (!currentEncounterId) return;

    try {
      const res = await getEncounterVitals(currentEncounterId);
      mapVitalsResponseToState(res.data);
    } catch (error) {
      if (error?.response?.status === 404) {
        resetVitalsForm();
        return;
      }

      console.error("Load vitals error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to load vitals");
    }
  };

  const roundTemperature = (value) => {
    return Number.parseFloat(Number(value).toFixed(1));
  };

  const convertTemperature = (value, fromUnit, toUnit) => {
    if (value === "" || value === null || value === undefined) return "";

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;

    if (fromUnit === toUnit) return value;

    if (fromUnit === "C" && toUnit === "F") {
      return roundTemperature((numericValue * 9) / 5 + 32).toString();
    }

    if (fromUnit === "F" && toUnit === "C") {
      return roundTemperature(((numericValue - 32) * 5) / 9).toString();
    }

    return value;
  };

  const handleTempUnitChange = (newUnit) => {
    if (vitals.tempUnit === newUnit) return;

    setVitals((prev) => ({
      ...prev,
      temperature: convertTemperature(prev.temperature, prev.tempUnit, newUnit),
      tempUnit: newUnit,
    }));
  };

  const hasNegativeVitals = () => {
    const numericFields = [
      vitals.systolic,
      vitals.diastolic,
      vitals.pulse,
      vitals.respiratory,
      vitals.spo2,
      vitals.height,
      vitals.weight,
      vitals.temperature,
    ];

    return numericFields.some((value) => value !== "" && Number(value) < 0);
  };

  const handleSaveVitals = async () => {
    const hasAnyValue = Object.entries(vitals).some(([key, value]) => {
      if (key === "tempUnit") return false;
      return String(value).trim() !== "";
    });
  
    if (!hasAnyValue) {
      alert("Please enter at least one vitals value");
      return;
    }
  
    if (hasNegativeVitals()) {
      alert("Negative values are not allowed in vitals");
      return;
    }
  
    try {
      setLoading(true);
  
      const currentEncounterId = await ensureEncounterExists();
  
      const payload = {
        systolicBp: vitals.systolic ? Number(vitals.systolic) : null,
        diastolicBp: vitals.diastolic ? Number(vitals.diastolic) : null,
        pulseRate: vitals.pulse ? Number(vitals.pulse) : null,
        respiratoryRate: vitals.respiratory ? Number(vitals.respiratory) : null,
        spo2: vitals.spo2 ? Number(vitals.spo2) : null,
        height: vitals.height ? Number(vitals.height) : null,
        weight: vitals.weight ? Number(vitals.weight) : null,
        temperature: vitals.temperature ? Number(vitals.temperature) : null,
        tempUnit: vitals.tempUnit || "C",
      };
  
      const res = await saveEncounterVitals(currentEncounterId, payload);
  
      setEncounterId(currentEncounterId);
      mapVitalsResponseToState(res.data);
  
      alert("Vitals saved successfully");
    } catch (error) {
      console.error("Save vitals error:", error?.response?.data || error);
  
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save vitals";
  
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Handlers ---------- */
  const addLab = () => {
    if (!labOrder) return;
    setLabs([...labs, { labOrder, labResult }]);
    setLabOrder("");
    setLabResult("");
  };

  const addRadiology = () => {
    if (!radiologyOrder) return;
    setRadiology([...radiology, { radiologyOrder, radiologyResult }]);
    setRadiologyOrder("");
    setRadiologyResult("");
  };

  const addAssessment = () => {
    if (!observation) return;
    setAssessments([...assessments, { observation, assessmentResult }]);
    setObservation("");
    setAssessmentResult("");
  };

  useEffect(() => {
    if (!patientId) return;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (!savedEncounterId) {
      setEncounterId(null);
      resetVitalsForm();
      return;
    }

    const parsedId = Number(savedEncounterId);
    if (Number.isNaN(parsedId)) {
      setEncounterId(null);
      resetVitalsForm();
      return;
    }

    setEncounterId(parsedId);
    loadVitals(parsedId);
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before creating or managing an assessment."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Assessment" />

        <div className="p-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <p className="text-sm text-gray-500 font-medium">
              Assessment page for the current encounter.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Encounter ID: {encounterId || "Not created yet"}
            </p>
          </div>

          {/* ================= VITALS ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vitals</h2>
              <p className="text-sm text-slate-500">
                Save vitals for the current encounter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <input
                type="number"
                min="0"
                placeholder="Systolic BP"
                value={vitals.systolic}
                onChange={(e) =>
                  setVitals({ ...vitals, systolic: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                placeholder="Diastolic BP"
                value={vitals.diastolic}
                onChange={(e) =>
                  setVitals({ ...vitals, diastolic: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                placeholder="Pulse Rate"
                value={vitals.pulse}
                onChange={(e) =>
                  setVitals({ ...vitals, pulse: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                placeholder="Respiratory Rate"
                value={vitals.respiratory}
                onChange={(e) =>
                  setVitals({ ...vitals, respiratory: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                placeholder="SpO2"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Height (cm)"
                value={vitals.height}
                onChange={(e) =>
                  setVitals({ ...vitals, height: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Weight (kg)"
                value={vitals.weight}
                onChange={(e) =>
                  setVitals({ ...vitals, weight: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />

              <div className="w-full">
                <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Temperature"
                    value={vitals.temperature}
                    onChange={(e) =>
                      setVitals({ ...vitals, temperature: e.target.value })
                    }
                    className="w-full px-4 py-2.5 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleTempUnitChange("C")}
                    className={`px-4 border-l transition ${
                      vitals.tempUnit === "C"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    °C
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTempUnitChange("F")}
                    className={`px-4 border-l transition ${
                      vitals.tempUnit === "F"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition font-medium disabled:opacity-50"
                onClick={handleSaveVitals}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Vitals"}
              </button>
            </div>
          </section>

          {/* ================= LAB ================= */}
          <Section
            title="Laboratory"
            item={labOrder}
            setItem={setLabOrder}
            result={labResult}
            setResult={setLabResult}
            add={addLab}
            data={labs}
            onDelete={(i) => setLabs(labs.filter((_, idx) => idx !== i))}
            itemKey="labOrder"
            resultKey="labResult"
            col1="Order"
            col2="Result"
          />

          {/* ================= RADIOLOGY ================= */}
          <Section
            title="Radiology"
            item={radiologyOrder}
            setItem={setRadiologyOrder}
            result={radiologyResult}
            setResult={setRadiologyResult}
            add={addRadiology}
            data={radiology}
            onDelete={(i) =>
              setRadiology(radiology.filter((_, idx) => idx !== i))
            }
            itemKey="radiologyOrder"
            resultKey="radiologyResult"
            col1="Order"
            col2="Impression"
          />

          {/* ================= ASSESSMENT ================= */}
          <Section
            title="Assessment"
            item={observation}
            setItem={setObservation}
            result={assessmentResult}
            setResult={setAssessmentResult}
            add={addAssessment}
            data={assessments}
            onDelete={(i) =>
              setAssessments(assessments.filter((_, idx) => idx !== i))
            }
            itemKey="observation"
            resultKey="assessmentResult"
            col1="Observation"
            col2="Result"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE SECTION ================= */
function Section({
  title,
  item,
  setItem,
  result,
  setResult,
  add,
  data,
  onDelete,
  itemKey,
  resultKey,
  col1,
  col2,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder={col1}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
        <input
          placeholder={col2}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
        <button
          onClick={add}
          className="bg-green-600 text-white rounded-xl px-4 py-2.5 hover:bg-green-700"
        >
          + Add
        </button>
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">{col1}</th>
                <th className="px-4 py-3 text-left">{col2}</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{d[itemKey]}</td>
                  <td className="px-4 py-3">{d[resultKey]}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDelete(i)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
