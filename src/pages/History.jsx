import { useState } from "react";

export default function History() {
  /* ================= Past Medical History ================= */
  const [pmh, setPmh] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");
  const [pastHistoryList, setPastHistoryList] = useState([]);

  /* ================= Family History ================= */
  const [familyHistory, setFamilyHistory] = useState("");
  const [relationship, setRelationship] = useState("");
  const [familyHistoryList, setFamilyHistoryList] = useState([]);

  /* -------- Handlers -------- */

  const addPastHistory = () => {
    if (!pmh) return;

    const timeSince = `${years || 0} y ${months || 0} m ${days || 0} d`;

    setPastHistoryList([
      ...pastHistoryList,
      { pmh, timeSince },
    ]);

    setPmh("");
    setYears("");
    setMonths("");
    setDays("");
  };

  const removePastHistory = (index) => {
    setPastHistoryList(pastHistoryList.filter((_, i) => i !== index));
  };

  const addFamilyHistory = () => {
    if (!familyHistory || !relationship) return;

    setFamilyHistoryList([
      ...familyHistoryList,
      { familyHistory, relationship },
    ]);

    setFamilyHistory("");
    setRelationship("");
  };

  const removeFamilyHistory = (index) => {
    setFamilyHistoryList(familyHistoryList.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-10">

        {/* ================= HEADER ================= */}
        <h1 className="text-2xl font-bold text-gray-800">
          History
        </h1>

        {/* ================= Past Medical History ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Past Medical History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Past Medical History"
              value={pmh}
              onChange={(e) => setPmh(e.target.value)}
              className="border rounded-lg px-3 py-2 md:col-span-2"
            />

            <input
              type="number"
              placeholder="Years"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="Months"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <button
              onClick={addPastHistory}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              +
            </button>
          </div>

          {pastHistoryList.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Past Medical History</th>
                  <th className="p-2 border">Time Since</th>
                  <th className="p-2 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {pastHistoryList.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="p-2 border">{item.pmh}</td>
                    <td className="p-2 border">{item.timeSince}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removePastHistory(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= Family History ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Family History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Family History"
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              className="border rounded-lg px-3 py-2 md:col-span-2"
            />

            <input
              type="text"
              placeholder="Relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <button
              onClick={addFamilyHistory}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              +
            </button>
          </div>

          {familyHistoryList.length > 0 && (
            <table className="w-full border mt-4">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Family History</th>
                  <th className="p-2 border">Relationship</th>
                  <th className="p-2 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {familyHistoryList.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="p-2 border">{item.familyHistory}</td>
                    <td className="p-2 border">{item.relationship}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeFamilyHistory(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
