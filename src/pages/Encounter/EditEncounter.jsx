import { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncounterDetails,
  updateEncounterNotes,
  deleteEncounterComplaint,
  deleteEncounterDiagnosis,
  deleteEncounterProcedure,
  addEncounterComplaint,
  getChiefComplaints,
  addEncounterDiagnosis,
  getIcdCodes,
  addEncounterProcedure,
  getProcedures,
  getProcedureSites,
  getProcedureDevices,
  getProcedureMethods,
} from "../../services/encounterApi";
import SectionHeader from "../../components/SectionHeader";

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

export default function EditEncounter() {
  const { id, encounterId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [encounter, setEncounter] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [complaint, setComplaint] = useState(null);
  const [days, setDays] = useState("");
  const [complaintOptions, setComplaintOptions] = useState([]);
  const [addingComplaint, setAddingComplaint] = useState(false);

  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [diagnosisType, setDiagnosisType] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [icdCode, setIcdCode] = useState(null);
  const [addingDiagnosis, setAddingDiagnosis] = useState(false);

  const [procedure, setProcedure] = useState(null);
  const [site, setSite] = useState(null);
  const [device, setDevice] = useState(null);
  const [method, setMethod] = useState(null);
  const [laterality, setLaterality] = useState(null);
  const [priority, setPriority] = useState(null);
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [methodOptions, setMethodOptions] = useState([]);
  const [addingProcedure, setAddingProcedure] = useState(false);

  const diagnosisTypeOptions = [
    { value: "PROVISIONAL", label: "Provisional" },
    { value: "FINAL", label: "Final" },
  ];

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

  const loadEncounter = async () => {
    if (!encounterId) return;

    try {
      setLoading(true);
      setError("");

      const res = await getEncounterDetails(encounterId);
      setEncounter(res.data);
      setNotes(res.data.notes || "");
    } catch (err) {
      console.error("Error loading encounter details:", err);
      setError("Failed to load encounter details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  const handleSaveNotes = async () => {
    try {
      setSaving(true);

      await updateEncounterNotes(encounterId, {
        notes: notes.trim(),
      });

      await loadEncounter();
      alert("Encounter notes updated successfully");
    } catch (err) {
      console.error("Error updating encounter notes:", err);
      alert("Failed to update encounter notes");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveComplaint = async (complaintId) => {
    try {
      await deleteEncounterComplaint(complaintId);
      await loadEncounter();
    } catch (err) {
      console.error("Error deleting complaint:", err);
      alert("Failed to delete complaint");
    }
  };

  const handleRemoveDiagnosis = async (diagnosisId) => {
    try {
      await deleteEncounterDiagnosis(diagnosisId);
      await loadEncounter();
    } catch (err) {
      console.error("Error deleting diagnosis:", err);
      alert("Failed to delete diagnosis");
    }
  };

  const handleRemoveProcedure = async (procedureId) => {
    try {
      await deleteEncounterProcedure(procedureId);
      await loadEncounter();
    } catch (err) {
      console.error("Error deleting procedure:", err);
      alert("Failed to delete procedure");
    }
  };

  const loadChiefComplaintOptions = async (search = "") => {
    try {
      const res = await getChiefComplaints(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.complaintName,
      }));

      setComplaintOptions(options);
    } catch (err) {
      console.error("Error loading chief complaints:", err);
    }
  };

  const handleAddComplaint = async () => {
    if (!complaint || days === "") {
      alert("Please select complaint and enter duration");
      return;
    }

    if (Number(days) < 1) {
      alert("Duration must be at least 1 day");
      return;
    }

    try {
      setAddingComplaint(true);

      await addEncounterComplaint({
        encounterId: Number(encounterId),
        complaintId: complaint.value,
        timeSinceDays: Number(days),
      });

      setComplaint(null);
      setDays("");

      await loadEncounter();
    } catch (err) {
      console.error("Error adding complaint:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Failed to add complaint";

      alert(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setAddingComplaint(false);
    }
  };

  useEffect(() => {
    loadChiefComplaintOptions();
  }, []);

  const loadIcdCodeOptions = async (search = "") => {
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
    } catch (err) {
      console.error("Error loading ICD codes:", err);
    }
  };

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

  const handleAddDiagnosis = async () => {
    if (!diagnosisType || !diagnosis) {
      alert("Please select diagnosis type and diagnosis");
      return;
    }

    try {
      setAddingDiagnosis(true);

      await addEncounterDiagnosis({
        encounterId: Number(encounterId),
        icdCodeId: diagnosis.value,
        diagnosisType: diagnosisType.value,
      });

      setDiagnosisType(null);
      setDiagnosis(null);
      setIcdCode(null);

      await loadEncounter();
    } catch (err) {
      console.error("Error adding diagnosis:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Failed to add diagnosis";

      alert(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setAddingDiagnosis(false);
    }
  };

  useEffect(() => {
    loadIcdCodeOptions();
  }, []);

  const loadProcedureOptions = async (search = "") => {
    try {
      const res = await getProcedures(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setProcedureOptions(options);
    } catch (err) {
      console.error("Error loading procedures:", err);
    }
  };

  const loadSiteOptions = async (search = "") => {
    try {
      const res = await getProcedureSites(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setSiteOptions(options);
    } catch (err) {
      console.error("Error loading sites:", err);
    }
  };

  const loadDeviceOptions = async (search = "") => {
    try {
      const res = await getProcedureDevices(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setDeviceOptions(options);
    } catch (err) {
      console.error("Error loading devices:", err);
    }
  };

  const loadMethodOptions = async (search = "") => {
    try {
      const res = await getProcedureMethods(search, 0, 20);

      const options = res.data.content.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setMethodOptions(options);
    } catch (err) {
      console.error("Error loading methods:", err);
    }
  };

  const handleAddProcedure = async () => {
    if (!procedure || !priority) {
      alert("Please select procedure and priority");
      return;
    }

    try {
      setAddingProcedure(true);

      await addEncounterProcedure({
        encounterId: Number(encounterId),
        procedureId: procedure.value,
        siteId: site?.value || null,
        deviceId: device?.value || null,
        methodId: method?.value || null,
        laterality: laterality?.value || null,
        priority: priority.value,
      });

      setProcedure(null);
      setSite(null);
      setDevice(null);
      setMethod(null);
      setLaterality(null);
      setPriority(null);

      await loadEncounter();
    } catch (err) {
      console.error("Error adding procedure:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Failed to add procedure";

      alert(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setAddingProcedure(false);
    }
  };

  useEffect(() => {
    loadProcedureOptions();
    loadSiteOptions();
    loadDeviceOptions();
    loadMethodOptions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6 rounded-3xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader title="Edit Encounter" />

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Edit details of this encounter.
            </p>

            <button
              onClick={() =>
                navigate(`/patients/${id}/encounter/${encounterId}/view`)
              }
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Back to View
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-700 font-medium">
              Loading encounter details...
            </p>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {!loading && !error && encounter && (
            <>
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm">
                <h2 className="text-xl font-bold text-black text-center mb-5">
                  Edit Encounter #{encounter.encounterId}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Patient
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.patientName || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Doctor
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.doctorName || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Date & Time
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.encounterDate
                        ? new Date(encounter.encounterDate).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Chief Complaints
                  </h2>
                  <p className="text-sm text-slate-500">
                    Existing complaints recorded for this encounter.
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
                          loadChiefComplaintOptions(inputValue);
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
                      onClick={handleAddComplaint}
                      disabled={addingComplaint}
                      className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                    >
                      {addingComplaint ? "Adding..." : "Add Complaint"}
                    </button>
                  </div>
                </div>

                {encounter.complaints?.length > 0 ? (
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
                        {encounter.complaints.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.complaint}</td>
                            <td className="px-4 py-3">
                              {item.timeSinceDays} days
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveComplaint(item.id)}
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
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No complaints added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Diagnosis
                  </h2>
                  <p className="text-sm text-slate-500">
                    Existing diagnoses recorded for this encounter.
                  </p>
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
                          loadIcdCodeOptions(inputValue);
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
                          loadIcdCodeOptions(inputValue);
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
                      onClick={handleAddDiagnosis}
                      disabled={addingDiagnosis}
                      className="w-full rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                    >
                      {addingDiagnosis ? "Adding..." : "Add Diagnosis"}
                    </button>
                  </div>
                </div>

                {encounter.diagnoses?.length > 0 ? (
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
                        {encounter.diagnoses.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.diagnosisType}</td>
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3">{item.code}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveDiagnosis(item.id)}
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
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No diagnoses added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Procedure
                  </h2>
                  <p className="text-sm text-slate-500">
                    Existing procedures recorded for this encounter.
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
                      onClick={handleAddProcedure}
                      disabled={addingProcedure}
                      className="w-full md:w-auto rounded-xl bg-blue-600 text-white px-6 py-2.5 hover:bg-blue-700 shadow disabled:opacity-50"
                    >
                      {addingProcedure ? "Adding..." : "Add Procedure"}
                    </button>
                  </div>
                </div>

                {encounter.procedures?.length > 0 ? (
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
                        {encounter.procedures.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.procedureName}</td>
                            <td className="px-4 py-3">{item.site || "-"}</td>
                            <td className="px-4 py-3">{item.device || "-"}</td>
                            <td className="px-4 py-3">{item.method || "-"}</td>
                            <td className="px-4 py-3">
                              {item.laterality || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {item.priority || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveProcedure(item.id)}
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
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No procedures added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Edit Encounter Notes
                  </h2>
                  <p className="text-sm text-slate-500">
                    Update doctor notes for this encounter.
                  </p>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Doctor notes..."
                  className="w-full min-h-[160px] rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />

                <div className="text-right">
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 shadow disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
