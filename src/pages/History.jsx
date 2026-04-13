import { useState, useEffect } from "react";
import Select from "react-select";
import { usePatient } from "../context/PatientContext";
import { useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";

export default function History() {
  const { id } = useParams();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [pastMaster, setPastMaster] = useState([]);
  const [familyMaster, setFamilyMaster] = useState([]);
  const [relationships, setRelationships] = useState([]);

  const [pastHistoryList, setPastHistoryList] = useState([]);
  const [familyHistoryList, setFamilyHistoryList] = useState([]);

  const [pmh, setPmh] = useState(null);
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");

  const [familyHistory, setFamilyHistory] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    fetch("http://localhost:8080/api/history/master-data")
      .then((res) => res.json())
      .then((data) => {
        setPastMaster(data.pastMedicalHistory || []);
        setFamilyMaster(data.familyHistory || []);
        setRelationships(data.relationships || []);
      })
      .catch((err) => console.error("Error loading master data:", err));
  }, []);

  useEffect(() => {
    if (!patientId) return;

    fetch(`http://localhost:8080/api/history/patient/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        setPastHistoryList(data.pastMedicalHistory || []);
        setFamilyHistoryList(data.familyHistory || []);
      })
      .catch((err) => console.error("Error loading patient history:", err));
  }, [patientId]);

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

  const addPastHistory = async () => {
    if (!pmh) {
      setErrorMessage("Please select a past medical condition.");
      return;
    }

    if (!years && !months && !days) {
      setErrorMessage("Please enter duration (years, months or days).");
      return;
    }

    if (Number(years) < 0 || Number(months) < 0 || Number(days) < 0) {
      setErrorMessage("Duration values cannot be negative.");
      return;
    }

    if (Number(months) > 11) {
      setErrorMessage("Months cannot be greater than 11.");
      return;
    }

    if (Number(days) > 31) {
      setErrorMessage("Days cannot be greater than 31.");
      return;
    }

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

    const body = {
      patientId,
      historyId: pmh.value,
      years: years || 0,
      months: months || 0,
      days: days || 0,
    };

    try {
      const res = await fetch("http://localhost:8080/api/history/past", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to add past history.");
        return;
      }

      setPastHistoryList([...pastHistoryList, data]);
      setPmh(null);
      setYears("");
      setMonths("");
      setDays("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error while adding past history.");
    }
  };

  const removePastHistory = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/history/past/${id}`, {
        method: "DELETE",
      });
      setPastHistoryList(pastHistoryList.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete past history.");
    }
  };

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

    const body = {
      patientId,
      historyId: familyHistory.value,
      relationshipId: relationship.value,
    };

    try {
      const res = await fetch("http://localhost:8080/api/history/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to add family history.");
        return;
      }

      setFamilyHistoryList([...familyHistoryList, data]);
      setFamilyHistory(null);
      setRelationship(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error while adding family history.");
    }
  };

  const removeFamilyHistory = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/history/family/${id}`, {
        method: "DELETE",
      });
      setFamilyHistoryList(familyHistoryList.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete family history.");
    }
  };

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <PatientSelectionRequired
            title="Please select a patient"
            message="A patient must be selected before viewing or updating patient history. You can open the patient list or add a new patient."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Patient History" />

        <div className="px-8 py-8 space-y-10">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Past Medical History
              </h2>
              <p className="text-sm text-slate-500">
                Add previous medical conditions with duration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Select
                  options={pastOptions}
                  value={pmh}
                  onChange={setPmh}
                  placeholder="Search condition..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <input
                type="number"
                min="0"
                placeholder="Years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              />

              <input
                type="number"
                min="0"
                max="11"
                placeholder="Months"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              />

              <input
                type="number"
                min="0"
                max="31"
                placeholder="Days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              />

              <button
                onClick={addPastHistory}
                className="rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow"
              >
                Add
              </button>
            </div>

            {pastHistoryList.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Past Medical History
                      </th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {pastHistoryList.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.historyName}</td>
                        <td className="px-4 py-3">
                          {item.years}y {item.months}m {item.days}d
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removePastHistory(item.id)}
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
              <h2 className="text-lg font-semibold text-gray-900">
                Family History
              </h2>
              <p className="text-sm text-slate-500">
                Add family condition with relationship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Select
                  options={familyOptions}
                  value={familyHistory}
                  onChange={setFamilyHistory}
                  placeholder="Search family condition..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <Select
                options={relationshipOptions}
                value={relationship}
                onChange={setRelationship}
                placeholder="Search relationship..."
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />

              <button
                onClick={addFamilyHistory}
                className="rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 shadow"
              >
                Add
              </button>
            </div>

            {familyHistoryList.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Family History</th>
                      <th className="px-4 py-3 text-left">Relationship</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {familyHistoryList.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.historyName}</td>
                        <td className="px-4 py-3">{item.relationshipName}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeFamilyHistory(item.id)}
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
