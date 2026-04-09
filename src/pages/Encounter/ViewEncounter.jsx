import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEncounterDetails } from "../../services/encounterApi";
import SectionHeader from "../../components/SectionHeader";

export default function ViewEncounter() {
  const { id, encounterId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [encounter, setEncounter] = useState(null);

  const loadEncounter = async () => {
    if (!encounterId) return;

    try {
      setLoading(true);
      setError("");

      const res = await getEncounterDetails(encounterId);
      setEncounter(res.data);
    } catch (err) {
      console.error("Error loading encounter details:", err);
      setError("Failed to load encounter details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 rounded-3xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader title="View Encounter" />

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              View complete details of this encounter.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/patients/${id}/encounters`)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
              >
                Back
              </button>

              <button
                onClick={() =>
                    navigate(`/patients/${id}/encounter/${encounterId}/edit`)
                }
                className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition font-medium"
              >
                Edit
              </button>
            </div>
          </div>

          {loading && (
            <div className="border rounded-xl p-6 bg-slate-50 border-slate-200">
              <p className="text-sm text-gray-700 font-medium">
                Loading encounter details...
              </p>
            </div>
          )}

          {error && (
            <div className="border rounded-xl p-6 bg-white border-slate-200">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && encounter && (
            <>
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm">
                <h2 className="text-xl font-bold text-black text-center mb-5">
                  Encounter Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Encounter ID
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.encounterId}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Patient Name
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.patientName || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Doctor
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {encounter.doctorName || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium text-sm">
                      Date & Time
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1">
                      {formatDateTime(encounter.encounterDate)}
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Chief Complaints
                  </h2>
                  <p className="text-sm text-slate-500">
                    All complaints recorded for this encounter.
                  </p>
                </div>

                {encounter.complaints?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Complaint</th>
                          <th className="px-4 py-3 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {encounter.complaints.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.complaint}</td>
                            <td className="px-4 py-3">
                              {item.timeSinceDays} days
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No complaints added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Diagnosis
                  </h2>
                  <p className="text-sm text-slate-500">
                    All diagnoses recorded for this encounter.
                  </p>
                </div>

                {encounter.diagnoses?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Diagnosis</th>
                          <th className="px-4 py-3 text-left">ICD Code</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {encounter.diagnoses.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.diagnosisType}</td>
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3">{item.code}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No diagnoses added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Procedure
                  </h2>
                  <p className="text-sm text-slate-500">
                    All procedures recorded for this encounter.
                  </p>
                </div>

                {encounter.procedures?.length > 0 ? (
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
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {encounter.procedures.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3">{item.procedureName}</td>
                            <td className="px-4 py-3">{item.site || "-"}</td>
                            <td className="px-4 py-3">{item.device || "-"}</td>
                            <td className="px-4 py-3">{item.method || "-"}</td>
                            <td className="px-4 py-3">
                              {item.laterality || "-"}
                            </td>
                            <td className="px-4 py-3">{item.priority || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-xl p-4 text-sm text-gray-700 bg-slate-50 border-slate-200">
                    No procedures added.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Encounter Notes
                  </h2>
                  <p className="text-sm text-slate-500">
                    Notes added for this encounter.
                  </p>
                </div>

                <div className="min-h-[140px] rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 text-slate-900 whitespace-pre-wrap">
                  {encounter.notes?.trim() || "No notes added."}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}