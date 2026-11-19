import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { usePatient } from "../context/PatientContext";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import { getMedicationHistoryByPatient } from "../services/medicationApi";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const formatLaterality = (value) => {
  if (!value) return "-";
  return value.charAt(0) + value.slice(1).toLowerCase();
};

export default function MedicationHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    getMedicationHistoryByPatient(patientId)
      .then((res) => setHistory(res.data || []))
      .catch((error) => {
        console.error("Load medication history error:", error?.response?.data || error);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before viewing medication history."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Medication History" />

        <div className="p-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 font-medium">
              Medications, Surgical Treatments, and Follow-ups across every
              encounter for this patient.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="bg-white text-blue-900 border border-blue-900 px-5 py-2 rounded-lg hover:bg-blue-50 shadow-sm transition font-medium"
            >
              ← Back
            </button>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Loading medication history...</p>
          )}

          {!loading && history.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center text-slate-400">
              No medication records found for this patient.
            </div>
          )}

          {!loading &&
            history.map((entry) => {
              const hasAnything =
                (entry.medications && entry.medications.length > 0) ||
                (entry.surgicalTreatments && entry.surgicalTreatments.length > 0) ||
                entry.followUp;

              return (
                <div
                  key={entry.encounterId}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                >
                  <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold">
                      Encounter #{entry.encounterId} — {formatDate(entry.encounterDate)}
                    </span>
                    <button
                      onClick={() =>
                        navigate(
                          `/patients/${patientId}/encounter/${entry.encounterId}/view`
                        )
                      }
                      className="text-xs bg-white text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 font-medium"
                    >
                      View Encounter
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {!hasAnything && (
                      <p className="text-sm text-slate-400">
                        No medication data recorded for this encounter.
                      </p>
                    )}

                    {/* MEDICATIONS */}
                    {entry.medications && entry.medications.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Medication
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 text-left">Medicine</th>
                                <th className="px-4 py-2 text-left">Dose Form</th>
                                <th className="px-4 py-2 text-left">Route</th>
                                <th className="px-4 py-2 text-left">Direction</th>
                                <th className="px-4 py-2 text-left">Dosage</th>
                                <th className="px-4 py-2 text-left">Duration</th>
                                <th className="px-4 py-2 text-left">Comment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.medications.map((m) => (
                                <tr key={m.id} className="border-t">
                                  <td className="px-4 py-2">{m.medicineName}</td>
                                  <td className="px-4 py-2">{m.doseForm || "-"}</td>
                                  <td className="px-4 py-2">
                                    {m.routeOfAdministration || "-"}
                                  </td>
                                  <td className="px-4 py-2">{m.directionOfUse}</td>
                                  <td className="px-4 py-2">{m.dosage}</td>
                                  <td className="px-4 py-2">{m.durationDays} Days</td>
                                  <td className="px-4 py-2">{m.comment || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SURGICAL TREATMENTS */}
                    {entry.surgicalTreatments && entry.surgicalTreatments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Surgical Treatment
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 text-left">Surgery</th>
                                <th className="px-4 py-2 text-left">Laterality</th>
                                <th className="px-4 py-2 text-left">Site</th>
                                <th className="px-4 py-2 text-left">Method</th>
                                <th className="px-4 py-2 text-left">Device</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.surgicalTreatments.map((s) => (
                                <tr key={s.id} className="border-t">
                                  <td className="px-4 py-2">{s.surgeryName}</td>
                                  <td className="px-4 py-2">
                                    {formatLaterality(s.laterality)}
                                  </td>
                                  <td className="px-4 py-2">{s.site || "-"}</td>
                                  <td className="px-4 py-2">{s.method || "-"}</td>
                                  <td className="px-4 py-2">{s.device || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* FOLLOW UP */}
                    {entry.followUp &&
                      (entry.followUp.followUpDate ||
                        entry.followUp.followUpInstructions) && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800 mb-2">
                            Follow Up
                          </h3>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {entry.followUp.followUpDate && (
                              <p>
                                <span className="text-slate-500">Date: </span>
                                {entry.followUp.followUpDate}
                              </p>
                            )}
                            {entry.followUp.followUpInstructions && (
                              <p className="mt-1">
                                <span className="text-slate-500">
                                  Instructions:{" "}
                                </span>
                                {entry.followUp.followUpInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
