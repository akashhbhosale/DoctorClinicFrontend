import { useState, useEffect } from "react";
import Select from "react-select";
import SectionHeader from "../components/SectionHeader";
import { useParams } from "react-router-dom";
import { usePatient } from "../context/PatientContext";
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
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;

  console.log("activePatient:", activePatient);
  console.log("route id:", id);

  const patientId = activePatient?.id || id;
  console.log("Patient ID:", patientId);

  const [encounterId, setEncounterId] = useState(null);

  const [complaint, setComplaint] = useState(null);
  const [days, setDays] = useState("");
  const [complaints, setComplaints] = useState([]);

  const [diagnosisType, setDiagnosisType] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);

  const [procedure, setProcedure] = useState(null);
  const [site, setSite] = useState(null);
  const [device, setDevice] = useState(null);
  const [method, setMethod] = useState(null);
  const [laterality, setLaterality] = useState(null);
  const [priority, setPriority] = useState(null);
  const [procedures, setProcedures] = useState([]);

  const [notes, setNotes] = useState("");
  const [complaintOptions, setComplaintOptions] = useState([]);

  const diagnosisTypeOptions = [
    { value: "PROVISIONAL", label: "Provisional" },
    { value: "FINAL", label: "Final" },
  ];

  const diagnosisOptions = [
    { value: 1, label: "Activities of Daily Living Alteration", code: "O38.1" },
    { value: 2, label: "Acute Pain", code: "Q63.1" },
    { value: 3, label: "Anxiety", code: "P40.0" },
  ];

  const procedureOptions = [
    { value: 7003, label: "Ultrasound scan of elbow" },
    { value: 7004, label: "Nebulization" },
  ];

  const siteOptions = [
    { value: 1, label: "Head" },
    { value: 2, label: "Chest" },
  ];

  const deviceOptions = [
    { value: 1, label: "Syringe" },
    { value: 2, label: "Nebuliser" },
  ];

  const methodOptions = [
    { value: 1, label: "Surgical" },
    { value: 2, label: "Manual" },
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

  const handleCreateEncounter = async () => {
    try {
      const payload = {
        patientId: Number(activePatient?.id),
        doctorId: 27,
      };

      console.log("Create encounter payload:", payload);

      const res = await createEncounter(payload);

      console.log("Encounter created response:", res.data);
      console.log("Encounter ID from backend:", res.data.id);

      setEncounterId(res.data.id);
      console.log("STATE encounterId SET TO:", res.data.id);
    } catch (error) {
      console.log("Create encounter error status:", error?.response?.status);
      console.log("Create encounter error data:", error?.response?.data);
    }
  };

  if (!patientId) {
    return <div className="p-6">Loading patient...</div>;
  }

  const addComplaint = async () => {
    if (!complaint || !days || !encounterId) return;

    try {
      const payload = {
        encounterId,
        complaintId: complaint.value,
        timeSinceDays: Number(days),
      };

      const res = await addEncounterComplaint(payload);

      setComplaints([
        ...complaints,
        {
          id: res.data.id,
          complaint: complaint.label,
          days: Number(days),
        },
      ]);

      setComplaint(null);
      setDays("");
    } catch (error) {
      console.error("Add complaint error:", error?.response?.data || error);
    }
  };

  const removeComplaint = async (id) => {
    try {
      await deleteEncounterComplaint(id);
      setComplaints(complaints.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete complaint error:", error?.response?.data || error);
    }
  };

  const addDiagnosis = async () => {
    if (!diagnosisType || !diagnosis || !encounterId) return;

    try {
      const payload = {
        encounterId,
        icdCodeId: diagnosis.value,
        diagnosisType: diagnosisType.value,
      };

      const res = await addEncounterDiagnosis(payload);

      setDiagnoses([
        ...diagnoses,
        {
          id: res.data.id,
          diagnosisType: diagnosisType.label,
          diagnosis: diagnosis.label,
          code: diagnosis.code,
        },
      ]);

      setDiagnosisType(null);
      setDiagnosis(null);
    } catch (error) {
      console.error("Add diagnosis error:", error?.response?.data || error);
    }
  };

  const removeDiagnosis = async (id) => {
    try {
      await deleteEncounterDiagnosis(id);
      setDiagnoses(diagnoses.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete diagnosis error:", error?.response?.data || error);
    }
  };

  const addProcedure = async () => {
    if (!procedure || !priority || !encounterId) return;

    try {
      const payload = {
        encounterId,
        procedureId: procedure.value,
        siteId: site?.value || null,
        deviceId: device?.value || null,
        methodId: method?.value || null,
        laterality: laterality?.value || null,
        priority: priority.value,
      };

      const res = await addEncounterProcedure(payload);

      setProcedures([
        ...procedures,
        {
          id: res.data.id,
          procedure: procedure.label,
          site: site?.label || "-",
          device: device?.label || "-",
          method: method?.label || "-",
          laterality: laterality?.label || "-",
          priority: priority.label,
        },
      ]);

      setProcedure(null);
      setSite(null);
      setDevice(null);
      setMethod(null);
      setLaterality(null);
      setPriority(null);
    } catch (error) {
      console.error("Add procedure error:", error?.response?.data || error);
    }
  };

  const removeProcedure = async (id) => {
    try {
      await deleteEncounterProcedure(id);
      setProcedures(procedures.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete procedure error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (activePatient?.id && encounterId === null) {
      handleCreateEncounter();
    }
  }, [activePatient?.id]);

  const saveEncounterNotes = async () => {
    if (!encounterId || !notes.trim()) return;

    try {
      await updateEncounterNotes(encounterId, {
        notes: notes,
      });

      alert("Encounter notes saved successfully");
    } catch (error) {
      console.error("Save notes error:", error?.response?.data || error);
    }
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
    try {
      console.log("loadEncounterDetails CALLED with id:", id);

      const res = await getEncounterDetails(id);

      console.log("API response:", res.data);

      const data = res.data;

      setComplaints(data.complaints || []);
      setDiagnoses(data.diagnoses || []);
      setProcedures(data.procedures || []);
      setNotes(data.notes || "");
    } catch (error) {
      console.error(
        "Load encounter details error:",
        error?.response?.data || error
      );
    }
  };

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
                  placeholder="Select type..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-6">
                <Select
                  options={diagnosisOptions}
                  value={diagnosis}
                  onChange={setDiagnosis}
                  placeholder="Search diagnosis..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-3">
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
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={deviceOptions}
                  value={device}
                  onChange={setDevice}
                  placeholder="Device..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  options={methodOptions}
                  value={method}
                  onChange={setMethod}
                  placeholder="Method..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                  isClearable
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
              className="rounded-xl bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 shadow"
              onClick={saveEncounterNotes}
            >
              Save Encounter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}