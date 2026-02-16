import { useState } from "react";

export default function Nursing() {
  // Inputs
  const [assessment, setAssessment] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [outcome, setOutcome] = useState("");
  const [outcomeScore, setOutcomeScore] = useState("");
  const [intervention, setIntervention] = useState("");

  // List
  const [nursingRecords, setNursingRecords] = useState([]);

  /* ---------------- Add ---------------- */
  const addNursingRecord = () => {
    if (!assessment || !diagnosis || !intervention) return;

    setNursingRecords([
      ...nursingRecords,
      {
        assessment,
        diagnosis,
        outcome,
        outcomeScore,
        intervention,
      },
    ]);

    // reset
    setAssessment("");
    setDiagnosis("");
    setOutcome("");
    setOutcomeScore("");
    setIntervention("");
  };

  /* ---------------- Remove ---------------- */
  const removeRecord = (index) => {
    setNursingRecords(nursingRecords.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-8">

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">Nursing</h1>

        {/* ================= Nursing Form ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Nursing Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nursing Assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Nursing Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Nursing Outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="Outcome Score"
              value={outcomeScore}
              onChange={(e) => setOutcomeScore(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Nursing Intervention"
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              className="border rounded-lg px-3 py-2 md:col-span-3"
            />

            <button
              onClick={addNursingRecord}
              className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
            >
              + Add
            </button>
          </div>

          {/* ================= Table ================= */}
          {nursingRecords.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Assessment</th>
                  <th className="p-2 border">Diagnosis</th>
                  <th className="p-2 border">Outcome</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Intervention</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {nursingRecords.map((n, i) => (
                  <tr key={i} className="text-center">
                    <td className="p-2 border">{n.assessment}</td>
                    <td className="p-2 border">{n.diagnosis}</td>
                    <td className="p-2 border">{n.outcome || "-"}</td>
                    <td className="p-2 border">{n.outcomeScore || "-"}</td>
                    <td className="p-2 border">{n.intervention}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeRecord(i)}
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

        {/* ================= Save ================= */}
        <div className="text-right">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => {
              console.log(nursingRecords);
              alert("Nursing data ready (check console)");
            }}
          >
            Save Nursing
          </button>
        </div>
      </div>
    </div>
  );
}
