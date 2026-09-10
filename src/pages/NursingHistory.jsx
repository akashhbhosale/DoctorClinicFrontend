import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePatient } from "../context/PatientContext";
import SectionHeader from "../components/SectionHeader";
import {
  getNursingHistoryByPatient,
  deleteEncounterNursing,
} from "../services/nursingApi";
import ConfirmModal from "../components/ConfirmModal";

export default function NursingHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activePatient } = usePatient();

  const patientId = activePatient?.id || id;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadNursingHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getNursingHistoryByPatient(patientId);

      setRecords(res.data || []);
    } catch (err) {
      console.error("Error loading nursing history:", err);
      setError("Failed to load nursing history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadNursingHistory();
    }
  }, [patientId]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString();
  };

  const openDeleteModal = (recordId) => {
    setSelectedRecordId(recordId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecordId) return;

    try {
      setDeleting(true);

      await deleteEncounterNursing(selectedRecordId);

      setIsDeleteModalOpen(false);
      setSelectedRecordId(null);

      await loadNursingHistory();
    } catch (err) {
      console.error("Error deleting nursing record:", err);
      alert("Failed to delete nursing record");
    } finally {
      setDeleting(false);
    }
  };

  // Group the flat list by encounter — a single encounter can have multiple
  // nursing rows (multiple interventions), same idea as EncounterHistory
  // showing one card per encounter, just one level deeper here.
  const groupedByEncounter = records.reduce((groups, record) => {
    const key = record.encounterId;
    if (!groups[key]) {
      groups[key] = {
        encounterId: record.encounterId,
        encounterDate: record.encounterDate,
        items: [],
      };
    }
    groups[key].items.push(record);
    return groups;
  }, {});

  // Backend already sorts by encounterDate desc, so Object.values preserves
  // that order (insertion order for object keys in JS).
  const encounterGroups = Object.values(groupedByEncounter);

  return (
    <div className="min-h-screen bg-slate-100 p-6 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader title="Nursing History" />

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              View all previous nursing assessments, diagnoses, and interventions
              for this patient, grouped by encounter.
            </p>

            <button
              onClick={() => navigate(`/patients/${patientId}/nursing`)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition font-medium"
            >
              Add Nursing Record
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-700 font-medium">
              Loading nursing history...
            </p>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {!loading && !error && encounterGroups.length === 0 && (
            <div className="border rounded-xl p-6 text-center text-gray-700 text-sm font-medium bg-slate-50 border-slate-200">
              No nursing records found for this patient.
            </div>
          )}

          {!loading && !error && encounterGroups.length > 0 && (
            <div className="space-y-4">
              {encounterGroups.map((group, index) => (
                <div
                  key={group.encounterId}
                  className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm hover:shadow-md transition"
                >
                  {/* Heading */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        Encounter {encounterGroups.length - index}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        {formatDateTime(group.encounterDate)} · Encounter ID: {group.encounterId}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/patients/${patientId}/encounter/${group.encounterId}/view`
                        )
                      }
                      className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition font-medium text-sm"
                    >
                      View Encounter
                    </button>
                  </div>

                  {/* Nursing rows for this encounter */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-4 py-2 text-left">Assessment</th>
                          <th className="px-4 py-2 text-left">Diagnosis</th>
                          <th className="px-4 py-2 text-left">Outcome</th>
                          <th className="px-4 py-2 text-left">Score</th>
                          <th className="px-4 py-2 text-left">Intervention</th>
                          <th className="px-4 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">{item.assessment}</td>
                            <td className="px-4 py-2">{item.diagnosis}</td>
                            <td className="px-4 py-2">{item.outcome || "-"}</td>
                            <td className="px-4 py-2">
                              {item.outcomeScore ?? "-"}
                            </td>
                            <td className="px-4 py-2">{item.intervention}</td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => openDeleteModal(item.id)}
                                className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRecordId(null);
        }}
        onConfirm={handleDeleteRecord}
        title="Delete Nursing Record"
        message="Are you sure you want to delete this nursing record? This cannot be undone."
        confirmLabel="Delete"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
