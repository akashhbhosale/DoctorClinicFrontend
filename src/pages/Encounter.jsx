import { useState } from "react";

export default function Encounter() {
  // Chief complaints
  const [complaint, setComplaint] = useState("");
  const [days, setDays] = useState("");
  const [complaints, setComplaints] = useState([]);

  // Diagnosis
  const [diagnosisType, setDiagnosisType] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnoses, setDiagnoses] = useState([]);
  const [icd10, setIcd10] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  // Procedures
  const [procedure, setProcedure] = useState("");
  const [laterality, setLaterality] = useState("");
  const [priority, setPriority] = useState("");
  const [site, setSite] = useState("");
  const [device, setDevice] = useState("");
  const [method, setMethod] = useState("");
  const [procedures, setProcedures] = useState([]);

  /* ---------------- Complaints ---------------- */
  const addComplaint = () => {
    if (!complaint || !days) return;

    setComplaints([...complaints, { complaint, days }]);
    setComplaint("");
    setDays("");
  };

  const removeComplaint = (index) => {
    setComplaints(complaints.filter((_, i) => i !== index));
  };

  /* ---------------- Diagnosis ---------------- */
  const addDiagnosis = () => {
    if (!diagnosisType || !diagnosis) return;

    setDiagnoses([...diagnoses, { diagnosisType, diagnosis, icd10 }]);

    setDiagnosisType("");
    setDiagnosis("");
    setIcd10("");
  };

  /* ---------------- Procedures ---------------- */
  const addProcedure = () => {
    if (!procedure || !priority) return;

    setProcedures([
      ...procedures,
      { procedure, laterality, priority, site, device, method },
    ]);

    setProcedure("");
    setLaterality("");
    setPriority("");
    setSite("");
    setDevice("");
    setMethod("");
  };

  const removeProcedure = (index) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  const removeDiagnosis = (index) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Encounter</h1>
        </div>

        {/* ================= Chief Complaints ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Chief Complaints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="border rounded-lg px-3 py-2 "
            />

            <input
              type="number"
              placeholder="Duration (days)"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="border rounded-lg px-3 py-2 "
            />

            <button
              onClick={addComplaint}
              className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
            >
              + Add
            </button>
          </div>

          {complaints.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Complaint</th>
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{c.complaint}</td>
                    <td className="p-2 border">{c.days} days</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeComplaint(i)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= Diagnosis ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Diagnosis</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={diagnosisType}
              onChange={(e) => setDiagnosisType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Select Type</option>
              <option value="Provisional">Provisional</option>
              <option value="Final">Final</option>
            </select>

            <input
              type="text"
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="ICD-10 Code"
              value={icd10}
              onChange={(e) => setIcd10(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <button
              onClick={addDiagnosis}
              className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
            >
              + Add
            </button>
          </div>

          {diagnoses.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Diagnosis</th>
                  <th className="p-2 border">ICD-10</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((d, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{d.diagnosisType}</td>
                    <td className="p-2 border">{d.diagnosis}</td>
                    <td className="p-2 border">{d.icd10 || "-"}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeDiagnosis(i)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= Procedures ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Procedures</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Procedure"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Laterality"
              value={laterality}
              onChange={(e) => setLaterality(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <input
              type="text"
              placeholder="Site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Device"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="text-right">
            <button
              onClick={addProcedure}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Procedure
            </button>
          </div>

          {procedures.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Procedure</th>
                  <th className="p-2 border">Site</th>
                  <th className="p-2 border">Device</th>
                  <th className="p-2 border">Method</th>
                  <th className="p-2 border">Laterality</th>
                  <th className="p-2 border">Priority</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((p, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{p.procedure}</td>
                    <td className="p-2 border">{p.site}</td>
                    <td className="p-2 border">{p.device}</td>
                    <td className="p-2 border">{p.method}</td>
                    <td className="p-2 border">{p.laterality || "N/A"}</td>
                    <td className="p-2 border">{p.priority}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeProcedure(i)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= Notes ================= */}
        <div className="border rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">
            Encounter Notes
          </h2>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Doctor notes..."
            className="w-full border rounded-lg p-3 min-h-[120px]"
          />
        </div>

        {/* ================= Save Button ================= */}
        <div className="text-right">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => {
              console.log({
                complaints,
                diagnoses,
                notes,
              });
              alert("Encounter data ready (check console)");
            }}
          >
            Save Encounter
          </button>
        </div>
      </div>
    </div>
  );
}
