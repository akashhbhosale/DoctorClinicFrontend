import { useState, useEffect } from "react";
import Select from "react-select";
import SectionHeader from "../components/SectionHeader";
import { useParams } from "react-router-dom";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import {
  createEncounter,
  addEncounterComplaint,
  addEncounterDiagnosis,
  addEncounterProcedure,
  updateEncounterNotes,
  deleteEncounterComplaint,
  deleteEncounterDiagnosis,
  deleteEncounterProcedure,
  getChiefComplaints,
  getEncounterDetails,
  getIcdCodes,
  getProcedures,
  getProcedureSites,
  getProcedureDevices,
  getProcedureMethods,
} from "../services/encounterApi";

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

export default function Encounter() {
  const { id } = useParams();
  const { doctor } = useDoctor();

  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;

  const patientId = activePatient?.id || id;

  const [loading, setLoading] = useState(false);

  const [encounterId, setEncounterId] = useState(null);

  const [complaint, setComplaint] = useState(null);
  const [days, setDays] = useState("");
  const [complaints, setComplaints] = useState([]);

  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [diagnosisType, setDiagnosisType] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [icdCode, setIcdCode] = useState(null);

  const diagnosisNameOptions = diagnosisOptions.map((item) => ({
    value: item.value,
    label: item.diagnosisLabel,
    code: item.code,
    description: item.description,
  }));

  const icdCodeOptions = diagnosisOptions.map((item) => ({
    value: item.value,
    label: item.icdLabel,
    code: item.code,
    description: item.description,
  }));

  const [procedure, setProcedure] = useState(null);
  const [site, setSite] = useState(null);
  const [device, setDevice] = useState(null);
  const [method, setMethod] = useState(null);
  const [laterality, setLaterality] = useState(null);
  const [priority, setPriority] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [notes, setNotes] = useState("");
  const [complaintOptions, setComplaintOptions] = useState([]);

  const [procedureOptions, setProcedureOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [methodOptions, setMethodOptions] = useState([]);

  const diagnosisTypeOptions = [
    { value: "PROVISIONAL", label: "Provisional" },
    { value: "FINAL", label: "Final" },
  ];

  const lateralityOptions = [
    { value: "LEFT", label: "Left" },
    { value: "RIGHT", label: "Right" },
    { value: "BILATERAL", label: "Bilateral" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const getEncounterStorageKey = () => `currentEncounter_${patientId}`;

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

    try {
      const payload = {
        patientId: Number(patientId),
        doctorId: doctor.id,
      };

      const res = await createEncounter(payload);
      const newEncounterId = res.data.id;

      setEncounterId(newEncounterId);
      sessionStorage.setItem(getEncounterStorageKey(), String(newEncounterId));

      return newEncounterId;
    } catch (error) {
      console.log("Create encounter error status:", error?.response?.status);
      console.log("Create encounter error data:", error?.response?.data);
      throw error;
    }
  };

  const addComplaint = async () => {
    if (!complaint || days === "") {
      alert("Please select complaint and enter duration");
      return;
    }

    if (Number(days) < 1) {
      alert("Duration must be at least 1 day");
      return;
    }

    try {
      setLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        complaintId: complaint.value,
        timeSinceDays: Number(days),
      };

      await addEncounterComplaint(payload);

      setComplaint(null);
      setDays("");

      await loadEncounterDetails(currentEncounterId);
    } catch (error) {
      console.error("Full add complaint error:", error);
      console.error("Backend error data:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        "Failed to add complaint";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const removeComplaint = async (id) => {
    try {
      setLoading(true);
      await deleteEncounterComplaint(id);
      await loadEncounterDetails(encounterId);
    } catch (error) {
      console.error("Delete complaint error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const addDiagnosis = async () => {
    if (!diagnosisType || !diagnosis) {
      alert("Please select diagnosis type and diagnosis");
      return;
    }

    try {
      setLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        icdCodeId: diagnosis.value,
        diagnosisType: diagnosisType.value,
      };

      await addEncounterDiagnosis(payload);

      setDiagnosisType(null);
      setDiagnosis(null);
      setIcdCode(null);

      await loadEncounterDetails(currentEncounterId);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to add diagnosis";

      alert(message);
      console.error("Add diagnosis error:", error);
    } finally {
      setLoading(false);
    }
  };

  // To load diagnosis from backend list
  const loadIcdCodes = async (search = "") => {
    try {
      const res = await getIcdCodes(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        diagnosisLabel: item.description,
        icdLabel: item.code,
        code: item.code,
        description: item.description,
      }));
      setDiagnosisOptions(options);
    } catch (error) {
      console.error("Load ICD codes error:", error?.response?.data || error);
    }
  };

  // Use effect for Icd codes
  useEffect(() => {
    loadIcdCodes();
  }, []);

  // To handle diagnosis Method
  const handleDiagnosisChange = (selected) => {
    setDiagnosis(selected);

    if (!selected) {
      setIcdCode(null);
      return;
    }
    const matchedCode = icdCodeOptions.find(
      (item) => item.value === selected.value
    );
    setIcdCode(matchedCode || null);
  };

  const handleIcdCodeChange = (selected) => {
    setIcdCode(selected);
    if (!selected) {
      setDiagnosis(null);
      return;
    }
    const matchedDiagnosis = diagnosisNameOptions.find(
      (item) => item.value === selected.value
    );
    setDiagnosis(matchedDiagnosis || null);
  };

  const removeDiagnosis = async (id) => {
    try {
      setLoading(true);
      await deleteEncounterDiagnosis(id);
      await loadEncounterDetails(encounterId);
    } catch (error) {
      console.error("Delete diagnosis error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const addProcedure = async () => {
    if (!procedure || !priority) {
      alert("Please select procedure and priority");
      return;
    }

    try {
      setLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      const payload = {
        encounterId: currentEncounterId,
        procedureId: procedure.value,
        siteId: site?.value || null,
        deviceId: device?.value || null,
        methodId: method?.value || null,
        laterality: laterality?.value || null,
        priority: priority.value,
      };

      await addEncounterProcedure(payload);

      setProcedure(null);
      setSite(null);
      setDevice(null);
      setMethod(null);
      setLaterality(null);
      setPriority(null);

      await loadEncounterDetails(currentEncounterId);
    } catch (error) {
      console.error("Add procedure error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // To load procedures from backend
  const loadProcedureOptions = async (search = "") => {
    try {
      const res = await getProcedures(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id, // used for API
        label: item.name, // shown in dropdown
      }));

      setProcedureOptions(options);
    } catch (error) {
      console.error("Load procedures error:", error?.response?.data || error);
    }
  };

  const removeProcedure = async (id) => {
    try {
      setLoading(true);
      await deleteEncounterProcedure(id);
      await loadEncounterDetails(encounterId);
    } catch (error) {
      console.error("Delete procedure error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // Use effect to load procedures
  useEffect(() => {
    loadProcedureOptions();
  }, []);

  // load site options
  const loadSiteOptions = async (search = "") => {
    try {
      const res = await getProcedureSites(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setSiteOptions(options);
    } catch (error) {
      console.error("Load sites error:", error?.response?.data || error);
    }
  };

  // To load devices fun
  const loadDeviceOptions = async (search = "") => {
    try {
      const res = await getProcedureDevices(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setDeviceOptions(options);
    } catch (error) {
      console.error("Load devices error:", error?.response?.data || error);
    }
  };

  // To load methods function
  const loadMethodOptions = async (search = "") => {
    try {
      const res = await getProcedureMethods(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setMethodOptions(options);
    } catch (error) {
      console.error("Load methods error:", error?.response?.data || error);
    }
  };

  // Use effect for site device and method
  useEffect(() => {
    loadSiteOptions();
    loadDeviceOptions();
    loadMethodOptions();
  }, []);

  // TO save Notes
  const saveEncounterNotes = async () => {
    if (
      complaints.length === 0 &&
      diagnoses.length === 0 &&
      procedures.length === 0 &&
      !notes.trim()
    ) {
      alert(
        "Please add at least one complaint, diagnosis, procedure, or notes"
      );
      return;
    }

    try {
      setLoading(true);

      const currentEncounterId = await ensureEncounterExists();

      if (notes.trim()) {
        await updateEncounterNotes(currentEncounterId, {
          notes: notes.trim(),
        });
      }

      sessionStorage.removeItem(getEncounterStorageKey());

      resetEncounterForm();

      alert("Encounter saved successfully");
    } catch (error) {
      console.error("Save notes error status:", error?.response?.status);
      console.error("Save notes error data:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        "Failed to save encounter";

      alert(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  const resetEncounterForm = () => {
    setEncounterId(null);

    setComplaint(null);
    setDays("");
    setComplaints([]);

    setDiagnosisType(null);
    setDiagnosis(null);
    setIcdCode(null);
    setDiagnoses([]);

    setProcedure(null);
    setSite(null);
    setDevice(null);
    setMethod(null);
    setLaterality(null);
    setPriority(null);
    setProcedures([]);

    setNotes("");
  };

  useEffect(() => {
    loadChiefComplaints();
  }, []);

  const loadChiefComplaints = async (search = "") => {
    try {
      const res = await getChiefComplaints(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.complaintName,
      }));

      setComplaintOptions(options);
    } catch (error) {
      console.error(
        "Load chief complaints error:",
        error?.response?.data || error
      );
    }
  };

  const loadEncounterDetails = async (id) => {
    if (!id) return;

    try {
      const res = await getEncounterDetails(id);
      const data = res.data;

      const complaintList = (data.complaints || []).map((c) => ({
        id: c.id,
        complaint: c.complaint,
        days: c.timeSinceDays,
      }));

      const diagnosisList = (data.diagnoses || []).map((d) => ({
        id: d.id,
        diagnosisType: d.diagnosisType,
        diagnosis: d.description,
        code: d.code,
      }));

      const procedureList = (data.procedures || []).map((p) => ({
        id: p.id,
        procedure: p.procedureName,
        site: p.site || "-",
        device: p.device || "-",
        method: p.method || "-",
        laterality: p.laterality || "-",
        priority: p.priority || "-",
      }));

      setComplaints(complaintList);
      setDiagnoses(diagnosisList);
      setProcedures(procedureList);
      setNotes(data.notes || "");
    } catch (error) {
      console.error(
        "Load encounter details error:",
        error?.response?.data || error
      );

      sessionStorage.removeItem(`currentEncounter_${patientId}`);
      setEncounterId(null);
      setComplaints([]);
      setDiagnoses([]);
      setProcedures([]);
      setNotes("");
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const savedEncounterId = sessionStorage.getItem(
      `currentEncounter_${patientId}`
    );
    if (!savedEncounterId) return;

    const parsedId = Number(savedEncounterId);
    if (Number.isNaN(parsedId)) return;

    setEncounterId(parsedId);
    loadEncounterDetails(parsedId);
  }, [patientId]);

  //If patient is not selected we need to select patient
  if (!patientId) {
    return <div className="p-6">Loading patient...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Encounter" />

        <div className="p-8 space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Chief Complaints
              </h2>
              <p className="text-sm text-slate-500">
                Add complaint with duration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-6">
                <Select
                  options={complaintOptions}
                  value={complaint}
                  onChange={setComplaint}
                  placeholder="Search complaint..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadChiefComplaints(inputValue);
                    }
                  }}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Duration (days)"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={addComplaint}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow"
                >
                  Add
                </button>
              </div>
            </div>

            {complaints.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Complaint</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {complaints.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.complaint}</td>
                        <td className="px-4 py-3">{item.days} days</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeComplaint(item.id)}
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Diagnosis
              </h2>
              <p className="text-sm text-slate-500">Add diagnosis with type.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <Select
                  options={diagnosisTypeOptions}
                  value={diagnosisType}
                  onChange={setDiagnosisType}
                  placeholder="Diagnosis Type"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-4">
                <Select
                  options={diagnosisNameOptions}
                  value={diagnosis}
                  onChange={handleDiagnosisChange}
                  placeholder="Diagnosis"
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadIcdCodes(inputValue);
                    }
                  }}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  options={icdCodeOptions}
                  value={icdCode}
                  onChange={handleIcdCodeChange}
                  placeholder="ICD-10 Code"
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadIcdCodes(inputValue);
                    }
                  }}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={addDiagnosis}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow"
                >
                  Add
                </button>
              </div>
            </div>

            {diagnoses.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Diagnosis</th>
                      <th className="px-4 py-3 text-left">ICD Code</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {diagnoses.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.diagnosisType}</td>
                        <td className="px-4 py-3">{item.diagnosis}</td>
                        <td className="px-4 py-3">{item.code}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeDiagnosis(item.id)}
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Procedure
              </h2>
              <p className="text-sm text-slate-500">
                Add procedure with optional details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-4">
                <Select
                  options={procedureOptions}
                  value={procedure}
                  onChange={setProcedure}
                  placeholder="Search procedure..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadProcedureOptions(inputValue);
                    }
                  }}
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={siteOptions}
                  value={site}
                  onChange={setSite}
                  placeholder="Site..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadSiteOptions(inputValue);
                    }
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={deviceOptions}
                  value={device}
                  onChange={setDevice}
                  placeholder="Device..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadDeviceOptions(inputValue);
                    }
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={methodOptions}
                  value={method}
                  onChange={setMethod}
                  placeholder="Method..."
                  onInputChange={(inputValue, actionMeta) => {
                    if (actionMeta.action === "input-change") {
                      loadMethodOptions(inputValue);
                    }
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={lateralityOptions}
                  value={laterality}
                  onChange={setLaterality}
                  placeholder="Laterality..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  options={priorityOptions}
                  value={priority}
                  onChange={setPriority}
                  placeholder="Priority..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-9">
                <button
                  onClick={addProcedure}
                  className="w-full md:w-auto rounded-xl bg-blue-600 text-white px-6 py-2.5 hover:bg-blue-700 shadow"
                >
                  Add Procedure
                </button>
              </div>
            </div>

            {procedures.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Procedure</th>
                      <th className="px-4 py-3 text-left">Site</th>
                      <th className="px-4 py-3 text-left">Device</th>
                      <th className="px-4 py-3 text-left">Method</th>
                      <th className="px-4 py-3 text-left">Laterality</th>
                      <th className="px-4 py-3 text-left">Priority</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {procedures.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.procedure}</td>
                        <td className="px-4 py-3">{item.site}</td>
                        <td className="px-4 py-3">{item.device}</td>
                        <td className="px-4 py-3">{item.method}</td>
                        <td className="px-4 py-3">{item.laterality}</td>
                        <td className="px-4 py-3">{item.priority}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeProcedure(item.id)}
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Encounter Notes
              </h2>
              <p className="text-sm text-slate-500">
                Add doctor notes for this encounter.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Doctor notes..."
              className="w-full min-h-[140px] rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </section>

          <div className="text-right">
            <button
              className="rounded-xl bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 shadow disabled:opacity-50"
              onClick={saveEncounterNotes}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Encounter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
