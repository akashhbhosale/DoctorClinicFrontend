import { useState, useEffect } from "react";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import { createEncounter } from "../services/encounterApi";
import {
  getEncounterVitals,
  saveEncounterVitals,
  getLaboratoryMaster,
  addEncounterLaboratory,
  getEncounterLaboratory,
  deleteEncounterLaboratory,
  uploadEncounterLaboratoryFile,
  getEncounterLaboratoryFiles,
  deleteEncounterLaboratoryFile,
  viewEncounterLaboratoryFile,
  getRadiologyMaster,
  addEncounterRadiology,
  getEncounterRadiology,
  deleteEncounterRadiology,
  uploadEncounterRadiologyFile,
  getEncounterRadiologyFiles,
  deleteEncounterRadiologyFile,
  viewEncounterRadiologyFile,
  getObservationMaster,
  addEncounterObservation,
  getEncounterObservation,
  deleteEncounterObservation,
} from "../services/assessmentApi";

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

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [selectedLaboratoryTest, setSelectedLaboratoryTest] = useState(null);
  const [laboratoryOptions, setLaboratoryOptions] = useState([]);
  const [labResult, setLabResult] = useState("");
  const [labs, setLabs] = useState([]);
  const [labLoading, setLabLoading] = useState(false);
  const [labFileLoadingId, setLabFileLoadingId] = useState(null);
  const [deletingLabFileId, setDeletingLabFileId] = useState(null);
  const [viewingFileId, setViewingFileId] = useState(null);

  // Shared "open a blob in a new tab" helper — used by both Laboratory
  // and Radiology view buttons. Opens PDFs/images inline in the browser's
  // own viewer since we're not building a custom in-app preview UI.
  const openFileBlob = async (fetchFn, fileId, fallbackErrorMessage) => {
    try {
      setViewingFileId(fileId);
      const res = await fetchFn(fileId);
      // res.data is ALREADY a correctly-typed Blob (axios sets its MIME
      // type from the response's Content-Type header when responseType
      // is "blob"). Re-wrapping it in `new Blob([res.data])` without
      // passing the type again strips that MIME type, which is why
      // images/PDFs were opening as raw garbled text instead of
      // rendering. Use res.data directly.
      const blobUrl = window.URL.createObjectURL(res.data);
      window.open(blobUrl, "_blank");
      // Release the blob URL a little later, after the new tab has had
      // a chance to load it.
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      console.error("View file error:", error?.response?.data || error);
      alert(fallbackErrorMessage);
    } finally {
      setViewingFileId(null);
    }
  };

  /* ================= RADIOLOGY (now fully persisted) ================= */
  const [selectedRadiologyOrder, setSelectedRadiologyOrder] = useState(null);
  const [radiologyOptions, setRadiologyOptions] = useState([]);
  const [radiologyResult, setRadiologyResult] = useState("");
  const [radiology, setRadiology] = useState([]);
  const [radiologyLoading, setRadiologyLoading] = useState(false);
  const [radiologyFileLoadingId, setRadiologyFileLoadingId] = useState(null);
  const [deletingRadiologyFileId, setDeletingRadiologyFileId] = useState(null);

  /* ================= ASSESSMENT / OBSERVATION (now fully persisted) ================= */
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [observationOptions, setObservationOptions] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

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

  /* ---------- Laboratory ---------- */
  const loadLaboratory = async (currentEncounterId) => {
    if (!currentEncounterId) return;

    try {
      const res = await getEncounterLaboratory(currentEncounterId);
      setLabs(res.data || []);
    } catch (error) {
      if (error?.response?.status === 404) {
        setLabs([]);
        return;
      }

      console.error("Load laboratory error:", error?.response?.data || error);
      alert(
        error?.response?.data?.message || "Failed to load laboratory records"
      );
    }
  };

  const addLab = async () => {
    if (!selectedLaboratoryTest) {
      alert("Please select laboratory test");
      return;
    }

    try {
      setLabLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        laboratoryMasterId: selectedLaboratoryTest.value,
        labResult: labResult.trim() || null,
      };

      await addEncounterLaboratory(payload);

      setSelectedLaboratoryTest(null);
      setLabResult("");

      await loadLaboratory(currentEncounterId);
    } catch (error) {
      console.error("Add laboratory error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add laboratory record";

      alert(message);
    } finally {
      setLabLoading(false);
    }
  };

  const removeLab = async (laboratoryId) => {
    try {
      setLabLoading(true);
      await deleteEncounterLaboratory(laboratoryId);
      await loadLaboratory(encounterId);
    } catch (error) {
      console.error("Delete laboratory error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete laboratory record";

      alert(message);
    } finally {
      setLabLoading(false);
    }
  };

  const loadLaboratoryMasterOptions = async (search = "") => {
    try {
      const res = await getLaboratoryMaster(search, 0, 20);

      const options = (res.data.content || []).map((item) => ({
        value: item.id,
        label: item.testName,
      }));

      setLaboratoryOptions(options);
    } catch (error) {
      console.error(
        "Load laboratory master error:",
        error?.response?.data || error
      );
    }
  };

  useEffect(() => {
    loadLaboratoryMasterOptions();
  }, []);

  const handleLaboratoryFileUpload = async (laboratoryId, file) => {
    if (!file) return;

    const isAllowed =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);

    if (!isAllowed) {
      alert("Only PDF, JPG, or PNG files are allowed");
      return;
    }

    try {
      setLabFileLoadingId(laboratoryId);

      await uploadEncounterLaboratoryFile(laboratoryId, file);
      await loadLaboratory(encounterId);

      alert("Laboratory report uploaded successfully");
    } catch (error) {
      console.error(
        "Upload laboratory file error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to upload laboratory PDF";

      alert(message);
    } finally {
      setLabFileLoadingId(null);
    }
  };

  const handleLaboratoryFileDelete = async (fileId) => {
    try {
      setDeletingLabFileId(fileId);

      await deleteEncounterLaboratoryFile(fileId);
      await loadLaboratory(encounterId);

      alert("Laboratory PDF deleted successfully");
    } catch (error) {
      console.error(
        "Delete laboratory file error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete laboratory PDF";

      alert(message);
    } finally {
      setDeletingLabFileId(null);
    }
  };

  /* ---------- Radiology (now real, persisted) ---------- */
  const loadRadiologyMasterOptions = async (search = "") => {
    try {
      const res = await getRadiologyMaster(search, 0, 20);

      const options = (res.data.content || []).map((item) => ({
        value: item.id,
        label: item.orderName,
      }));

      setRadiologyOptions(options);
    } catch (error) {
      console.error("Load radiology master error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    loadRadiologyMasterOptions();
  }, []);

  const loadRadiology = async (currentEncounterId) => {
    if (!currentEncounterId) return;

    try {
      const res = await getEncounterRadiology(currentEncounterId);
      setRadiology(res.data || []);
    } catch (error) {
      if (error?.response?.status === 404) {
        setRadiology([]);
        return;
      }
      console.error("Load radiology error:", error?.response?.data || error);
    }
  };

  const addRadiology = async () => {
    if (!selectedRadiologyOrder) {
      alert("Please select a radiology order");
      return;
    }

    try {
      setRadiologyLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        radiologyMasterId: selectedRadiologyOrder.value,
        radiologyResult: radiologyResult.trim() || null,
      };

      await addEncounterRadiology(payload);

      setSelectedRadiologyOrder(null);
      setRadiologyResult("");

      await loadRadiology(currentEncounterId);
    } catch (error) {
      console.error("Add radiology error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add radiology record";

      alert(message);
    } finally {
      setRadiologyLoading(false);
    }
  };

  const removeRadiology = async (radiologyId) => {
    try {
      setRadiologyLoading(true);
      await deleteEncounterRadiology(radiologyId);
      await loadRadiology(encounterId);
    } catch (error) {
      console.error("Delete radiology error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete radiology record";

      alert(message);
    } finally {
      setRadiologyLoading(false);
    }
  };

  const handleRadiologyFileUpload = async (radiologyId, file) => {
    if (!file) return;

    const isAllowed =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);

    if (!isAllowed) {
      alert("Only PDF, JPG, or PNG files are allowed");
      return;
    }

    try {
      setRadiologyFileLoadingId(radiologyId);

      await uploadEncounterRadiologyFile(radiologyId, file);
      await loadRadiology(encounterId);

      alert("Radiology report uploaded successfully");
    } catch (error) {
      console.error(
        "Upload radiology file error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to upload radiology report";

      alert(message);
    } finally {
      setRadiologyFileLoadingId(null);
    }
  };

  const handleRadiologyFileDelete = async (fileId) => {
    try {
      setDeletingRadiologyFileId(fileId);

      await deleteEncounterRadiologyFile(fileId);
      await loadRadiology(encounterId);

      alert("Radiology report deleted successfully");
    } catch (error) {
      console.error(
        "Delete radiology file error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete radiology report";

      alert(message);
    } finally {
      setDeletingRadiologyFileId(null);
    }
  };

  /* ---------- Assessment / Observation (now real, persisted) ---------- */
  const loadObservationMasterOptions = async (search = "") => {
    try {
      const res = await getObservationMaster(search, 0, 20);

      const options = (res.data.content || []).map((item) => ({
        value: item.id,
        label: item.observationName,
      }));

      setObservationOptions(options);
    } catch (error) {
      console.error("Load observation master error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    loadObservationMasterOptions();
  }, []);

  const loadAssessments = async (currentEncounterId) => {
    if (!currentEncounterId) return;

    try {
      const res = await getEncounterObservation(currentEncounterId);
      setAssessments(res.data || []);
    } catch (error) {
      if (error?.response?.status === 404) {
        setAssessments([]);
        return;
      }
      console.error("Load observation error:", error?.response?.data || error);
    }
  };

  const addAssessment = async () => {
    if (!selectedObservation) {
      alert("Please select an observation");
      return;
    }

    try {
      setAssessmentLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        observationMasterId: selectedObservation.value,
        assessmentResult: assessmentResult.trim() || null,
      };

      await addEncounterObservation(payload);

      setSelectedObservation(null);
      setAssessmentResult("");

      await loadAssessments(currentEncounterId);
    } catch (error) {
      console.error("Add observation error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add observation record";

      alert(message);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const removeAssessment = async (observationId) => {
    try {
      setAssessmentLoading(true);
      await deleteEncounterObservation(observationId);
      await loadAssessments(encounterId);
    } catch (error) {
      console.error("Delete observation error:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete observation record";

      alert(message);
    } finally {
      setAssessmentLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (!savedEncounterId) {
      setEncounterId(null);
      resetVitalsForm();
      setLabs([]);
      setRadiology([]);
      setAssessments([]);
      return;
    }

    const parsedId = Number(savedEncounterId);
    if (Number.isNaN(parsedId)) {
      setEncounterId(null);
      resetVitalsForm();
      setLabs([]);
      setRadiology([]);
      setAssessments([]);
      return;
    }

    setEncounterId(parsedId);
    loadVitals(parsedId);
    loadLaboratory(parsedId);
    loadRadiology(parsedId);
    loadAssessments(parsedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Assessment page for the current encounter.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Encounter ID: {encounterId || "Not created yet"}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!patientId) return;
                  navigate(`/patients/${patientId}/assessment-history`);
                }}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 shadow-sm transition font-medium"
              >
                Assessment History
              </button>
            </div>
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Laboratory
              </h2>
              <p className="text-sm text-slate-500">
                Add laboratory test with result.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-6">
                <Select
                  options={laboratoryOptions}
                  value={selectedLaboratoryTest}
                  onChange={setSelectedLaboratoryTest}
                  placeholder="Search laboratory test..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadLaboratoryMasterOptions(inputValue);
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
                <input
                  value={labResult}
                  onChange={(e) => setLabResult(e.target.value)}
                  placeholder="Result"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={addLab}
                  disabled={labLoading}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                >
                  {labLoading ? "Saving..." : "Add"}
                </button>
              </div>
            </div>

            {labs.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Test Name</th>
                      <th className="px-4 py-3 text-left">Result</th>
                      <th className="px-4 py-3 text-left">PDF Report</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {labs.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3">{item.testName}</td>

                        <td className="px-4 py-3">{item.labResult || "-"}</td>

                        <td className="px-4 py-3">
                          <div className="space-y-3">
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleLaboratoryFileUpload(item.id, file);
                                    e.target.value = "";
                                  }
                                }}
                                className="block w-full text-sm text-slate-600
                               file:mr-4 file:rounded-lg file:border-0
                               file:bg-blue-50 file:px-4 file:py-2
                               file:text-sm file:font-medium
                               file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {labFileLoadingId === item.id && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Uploading PDF...
                                </p>
                              )}
                            </div>

                            {item.files && item.files.length > 0 ? (
                              <div className="space-y-2">
                                {item.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm text-slate-700 truncate">
                                        {file.originalFileName}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {(file.fileSize / 1024).toFixed(1)} KB
                                      </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() =>
                                          openFileBlob(
                                            viewEncounterLaboratoryFile,
                                            file.id,
                                            "Failed to open lab report"
                                          )
                                        }
                                        disabled={viewingFileId === file.id}
                                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {viewingFileId === file.id
                                          ? "Opening..."
                                          : "View"}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleLaboratoryFileDelete(file.id)
                                        }
                                        disabled={deletingLabFileId === file.id}
                                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {deletingLabFileId === file.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No PDF uploaded
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeLab(item.id)}
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

          {/* ================= RADIOLOGY (now real) ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Radiology
              </h2>
              <p className="text-sm text-slate-500">
                Add radiology order with impression/result.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-6">
                <Select
                  options={radiologyOptions}
                  value={selectedRadiologyOrder}
                  onChange={setSelectedRadiologyOrder}
                  placeholder="Search radiology order..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadRadiologyMasterOptions(inputValue);
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
                <input
                  value={radiologyResult}
                  onChange={(e) => setRadiologyResult(e.target.value)}
                  placeholder="Impression"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={addRadiology}
                  disabled={radiologyLoading}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                >
                  {radiologyLoading ? "Saving..." : "+ Add"}
                </button>
              </div>
            </div>

            {radiology.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Impression</th>
                      <th className="px-4 py-3 text-left">Report</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {radiology.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3">{item.orderName}</td>
                        <td className="px-4 py-3">
                          {item.radiologyResult || "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-3">
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleRadiologyFileUpload(item.id, file);
                                    e.target.value = "";
                                  }
                                }}
                                className="block w-full text-sm text-slate-600
                               file:mr-4 file:rounded-lg file:border-0
                               file:bg-blue-50 file:px-4 file:py-2
                               file:text-sm file:font-medium
                               file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {radiologyFileLoadingId === item.id && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Uploading report...
                                </p>
                              )}
                            </div>

                            {item.files && item.files.length > 0 ? (
                              <div className="space-y-2">
                                {item.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm text-slate-700 truncate">
                                        {file.originalFileName}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {(file.fileSize / 1024).toFixed(1)} KB
                                      </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() =>
                                          openFileBlob(
                                            viewEncounterRadiologyFile,
                                            file.id,
                                            "Failed to open radiology report"
                                          )
                                        }
                                        disabled={viewingFileId === file.id}
                                        className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {viewingFileId === file.id
                                          ? "Opening..."
                                          : "View"}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleRadiologyFileDelete(file.id)
                                        }
                                        disabled={
                                          deletingRadiologyFileId === file.id
                                        }
                                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {deletingRadiologyFileId === file.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No report uploaded
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeRadiology(item.id)}
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

          {/* ================= ASSESSMENT / OBSERVATION (now real) ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assessment
              </h2>
              <p className="text-sm text-slate-500">
                Add observation with result.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-6">
                <Select
                  options={observationOptions}
                  value={selectedObservation}
                  onChange={setSelectedObservation}
                  placeholder="Search observation..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadObservationMasterOptions(inputValue);
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
                <input
                  value={assessmentResult}
                  onChange={(e) => setAssessmentResult(e.target.value)}
                  placeholder="Result"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={addAssessment}
                  disabled={assessmentLoading}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                >
                  {assessmentLoading ? "Saving..." : "+ Add"}
                </button>
              </div>
            </div>

            {assessments.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Observation</th>
                      <th className="px-4 py-3 text-left">Result</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {assessments.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.observationName}</td>
                        <td className="px-4 py-3">
                          {item.assessmentResult || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeAssessment(item.id)}
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
