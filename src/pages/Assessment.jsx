import { useState } from "react";

export default function Assessment() {
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

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-8">
        {/* ================= HEADER ================= */}
        <h1 className="text-2xl font-bold text-gray-800">
          Diagnostic Assessment
        </h1>

        {/* ================= VITALS ================= */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Vitals</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Systolic BP"
              value={vitals.systolic}
              onChange={(e) =>
                setVitals({ ...vitals, systolic: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="Diastolic BP"
              value={vitals.diastolic}
              onChange={(e) =>
                setVitals({ ...vitals, diastolic: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="Pulse Rate"
              value={vitals.pulse}
              onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
              className="border p-2 rounded"
            />

            <input
              placeholder="Respiratory Rate"
              value={vitals.respiratory}
              onChange={(e) =>
                setVitals({ ...vitals, respiratory: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="SpO2"
              value={vitals.spo2}
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
              className="border p-2 rounded"
            />

            <input
              placeholder="Height (cm)"
              value={vitals.height}
              onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
              className="border p-2 rounded"
            />

            <input
              placeholder="Weight (kg)"
              value={vitals.weight}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              className="border p-2 rounded"
            />

            <input
              placeholder="Temperature"
              value={vitals.temperature}
              onChange={(e) =>
                setVitals({ ...vitals, temperature: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>

          <div className="flex gap-4 mt-2">
            <label>
              <input
                type="radio"
                checked={vitals.tempUnit === "C"}
                onChange={() => setVitals({ ...vitals, tempUnit: "C" })}
              />{" "}
              °C
            </label>
            <label>
              <input
                type="radio"
                checked={vitals.tempUnit === "F"}
                onChange={() => setVitals({ ...vitals, tempUnit: "F" })}
              />{" "}
              °F
            </label>
          </div>
        </div>

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

        {/* ================= SAVE ================= */}
        <div className="text-right">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              console.log({ vitals, labs, radiology, assessments });
              alert("Assessment data ready (check console)");
            }}
          >
            Save Assessment
          </button>
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
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder={col1}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder={col2}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={add}
          className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
        >
          + Add
        </button>
      </div>

      {data.length > 0 && (
        <table className="w-full border mt-4">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border p-2">{col1}</th>
              <th className="border p-2">{col2}</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{d[itemKey]}</td>
                <td className="border p-2">{d[resultKey]}</td>
                <td className="border p-2">
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
      )}
    </div>
  );
}
