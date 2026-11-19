import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { usePatient } from "../context/PatientContext";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import {
  getNursingHistoryByPatient,
  deleteNursingAssessmentRecord,
} from "../services/nursingApi";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

// The API returns a flat list (most recent encounter first). Group it by
// encounter so each visit is one card, keeping the server's ordering.
const groupByEncounter = (records) => {
  const groups = [];
  const indexById = new Map();

  records.forEach((record) => {
    if (!indexById.has(record.encounterId)) {
      indexById.set(record.encounterId, groups.length);
      groups.push({
        encounterId: record.encounterId,
        encounterDate: record.encounterDate,
        records: [],
      });
    }
    groups[indexById.get(record.encounterId)].records.push(record);
  });

  return groups;
};

export default function NursingHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const res = await getNursingHistoryByPatient(patientId);
      setRecords(res.data || []);
    } catch (error) {
      console.error("Load nursing history error:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleDelete = async (recordId) => {
    if (
      !window.confirm(
        "Remove this assessment and ALL interventions logged under it?"
      )
    ) {
      return;
    }

    try {
      setDeletingId(recordId);
      await deleteNursingAssessmentRecord(recordId);
      await loadHistory();
    } catch (error) {
      console.error("Delete nursing record error:", error?.response?.data || error);
      alert("Failed to remove assessment");
    } finally {
      setDeletingId(null);
    }
  };

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before viewing nursing history."
        />
      </div>
    );
  }

  const groups = groupByEncounter(records);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Nursing History" />

        <div className="p-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 font-medium">
              Nursing assessments and the interventions logged under each,
              across every encounter for this patient.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="bg-white text-blue-900 border border-blue-900 px-5 py-2 rounded-lg hover:bg-blue-50 shadow-sm transition font-medium"
            >
              ← Back
            </button>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Loading nursing history...</p>
          )}

          {!loading && groups.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center text-slate-400">
              No nursing records found for this patient.
            </div>
          )}

          {!loading &&
            groups.map((group) => (
              <div
                key={group.encounterId}
                className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
              >
                <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold">
                    Encounter #{group.encounterId} — {formatDate(group.encounterDate)}
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        `/patients/${patientId}/encounter/${group.encounterId}/view`
                      )
                    }
                    className="text-xs bg-white text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 font-medium"
                  >
                    View Encounter
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {group.records.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-slate-50 px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
                        <div className="text-sm space-y-0.5">
                          <p>
                            <span className="text-slate-500">Assessment: </span>
                            <span className="font-medium text-slate-800">
                              {record.assessment}
                            </span>
                          </p>
                          <p>
                            <span className="text-slate-500">Diagnosis: </span>
                            <span className="font-medium text-slate-800">
                              {record.diagnosis}
                            </span>
                          </p>
                          <p>
                            <span className="text-slate-500">Outcome: </span>
                            <span className="font-medium text-slate-800">
                              {record.outcome || "-"}
                              {record.outcomeScore !== null &&
                              record.outcomeScore !== undefined
                                ? ` (Score: ${record.outcomeScore})`
                                : ""}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === record.id ? "Removing..." : "Remove"}
                        </button>
                      </div>

                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          Interventions ({record.interventions?.length || 0})
                        </p>

                        {record.interventions && record.interventions.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full text-sm">
                              <thead className="bg-slate-100 text-slate-600">
                                <tr>
                                  <th className="px-3 py-2 text-left">Time</th>
                                  <th className="px-3 py-2 text-left">
                                    Intervention
                                  </th>
                                  <th className="px-3 py-2 text-left">Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.interventions.map((item) => (
                                  <tr key={item.id} className="border-t">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {formatDate(item.interventionTime)}
                                    </td>
                                    <td className="px-3 py-2">{item.intervention}</td>
                                    <td className="px-3 py-2">{item.note || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No interventions were logged for this assessment.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
