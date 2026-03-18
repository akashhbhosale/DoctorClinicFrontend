import { useState, useEffect } from "react";
import Select from "react-select";
import { usePatient } from "../context/PatientContext";
import { useParams } from "react-router-dom";

export default function History() {
  const { id } = useParams();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;   
  const patientId = activePatient?.id || id;
  console.log("Active Patient:", activePatient);

  /* ================= MASTER DATA ================= */

  const [pastMaster, setPastMaster] = useState([]);
  const [familyMaster, setFamilyMaster] = useState([]);
  const [relationships, setRelationships] = useState([]);

  /* ================= PATIENT DATA ================= */

  const [pastHistoryList, setPastHistoryList] = useState([]);
  const [familyHistoryList, setFamilyHistoryList] = useState([]);

  /* ================= FORM STATES ================= */

  const [pmh, setPmh] = useState(null);
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");

  const [familyHistory, setFamilyHistory] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  /* ================= AUTO HIDE ERROR ================= */

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetch("http://localhost:8080/api/history/master-data")
      .then((res) => res.json())
      .then((data) => {
        setPastMaster(data.pastMedicalHistory);
        setFamilyMaster(data.familyHistory);
        setRelationships(data.relationships);
      });
  }, []);
  
  /* ================= Link Patient's DATA ================= */
  useEffect(() => {
    if (!patientId) return;

    fetch(`http://localhost:8080/api/history/patient/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        setPastHistoryList(data.pastMedicalHistory);
        setFamilyHistoryList(data.familyHistory);
      });
  }, [patientId]);

  /* ================= OPTIONS ================= */

  const pastOptions = pastMaster.map((item) => ({
    value: item.id,
    label: item.historyName,
  }));

  const familyOptions = familyMaster.map((item) => ({
    value: item.id,
    label: item.historyName,
  }));

  const relationshipOptions = relationships.map((item) => ({
    value: item.id,
    label: item.relationshipName,
  }));

  /* ================= ADD PAST HISTORY ================= */

  const addPastHistory = async () => {
    // EMPTY VALIDATION
    if (!pmh) {
      setErrorMessage("Please select a past medical condition.");
      return;
    }

    if (!years && !months && !days) {
      setErrorMessage("Please enter duration (years, months or days).");
      return;
    }

    if (years < 0) {
      setErrorMessage("Years cannot be negative.");
      return;
    }

    if (months < 0) {
      setErrorMessage("Months cannot be negative.");
      return;
    }

    if (days < 0) {
      setErrorMessage("Days cannot be negative.");
      return;
    }

    if (months > 11) {
      setErrorMessage("Months cannot be greater than 11.");
      return;
    }

    if (days > 31) {
      setErrorMessage("Days cannot be greater than 31.");
      return;
    }

    // DUPLICATE CHECK
    const alreadyExists = pastHistoryList.some(
      (item) => item.historyId === pmh.value
    );

    if (alreadyExists) {
      setErrorMessage("This history already exists for this patient.");

      setPmh(null);
      setYears("");
      setMonths("");
      setDays("");

      return;
    }

    setErrorMessage("");

    const body = {
      patientId: patientId,
      historyId: pmh.value,
      years: years || 0,
      months: months || 0,
      days: days || 0,
    };

    const res = await fetch("http://localhost:8080/api/history/past", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    setPastHistoryList([...pastHistoryList, data]);

    setPmh(null);
    setYears("");
    setMonths("");
    setDays("");
  };

  /* ================= DELETE PAST HISTORY ================= */

  const removePastHistory = async (id) => {
    await fetch(`http://localhost:8080/api/history/past/${id}`, {
      method: "DELETE",
    });

    setPastHistoryList(pastHistoryList.filter((item) => item.id !== id));
  };

  /* ================= ADD FAMILY HISTORY ================= */

  const addFamilyHistory = async () => {
    if (!familyHistory) {
      setErrorMessage("Please select a family condition.");
      return;
    }

    if (!relationship) {
      setErrorMessage("Please select relationship.");
      return;
    }

    const alreadyExists = familyHistoryList.some(
      (item) =>
        item.historyId === familyHistory.value &&
        item.relationshipId === relationship.value
    );

    if (alreadyExists) {
      setErrorMessage("This family history already exists.");

      setFamilyHistory(null);
      setRelationship(null);

      return;
    }

    setErrorMessage("");

    const body = {
      patientId: patientId,
      historyId: familyHistory.value,
      relationshipId: relationship.value,
    };

    const res = await fetch("http://localhost:8080/api/history/family", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    setFamilyHistoryList([...familyHistoryList, data]);

    setFamilyHistory(null);
    setRelationship(null);
  };
  /* ================= DELETE FAMILY HISTORY ================= */

  const removeFamilyHistory = async (id) => {
    await fetch(`http://localhost:8080/api/history/family/${id}`, {
      method: "DELETE",
    });

    setFamilyHistoryList(familyHistoryList.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-10">
        <h1 className="text-2xl font-bold text-gray-800">History</h1>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* ================= Past Medical History ================= */}

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Past Medical History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Select
              options={pastOptions}
              value={pmh}
              onChange={setPmh}
              placeholder="Search Condition..."
              className="md:col-span-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Years"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              max="11"
              placeholder="Months"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              min="0"
              max="31"
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
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Remove</th>
                </tr>
              </thead>

              <tbody>
                {pastHistoryList.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="p-2 border">{item.historyName}</td>

                    <td className="p-2 border">
                      {item.years}y {item.months}m {item.days}d
                    </td>

                    <td className="p-2 border">
                      <button
                        onClick={() => removePastHistory(item.id)}
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
            <Select
              options={familyOptions}
              value={familyHistory}
              onChange={setFamilyHistory}
              placeholder="Search Family Condition..."
              className="md:col-span-2"
            />

            <Select
              options={relationshipOptions}
              value={relationship}
              onChange={setRelationship}
              placeholder="Search Relationship..."
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
                {familyHistoryList.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="p-2 border">{item.historyName}</td>

                    <td className="p-2 border">{item.relationshipName}</td>

                    <td className="p-2 border">
                      <button
                        onClick={() => removeFamilyHistory(item.id)}
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
