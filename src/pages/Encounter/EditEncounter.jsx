import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncounterDetails,
  updateEncounterNotes,
} from "../../services/encounterApi";
import SectionHeader from "../../components/SectionHeader";

export default function EditEncounter() {
  const { id, encounterId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [encounter, setEncounter] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-100 p-6 rounded-3xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader title="Edit Encounter" />

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Edit details of this encounter.
            </p>

            <button
              onClick={() =>
                navigate(`/patients/${id}/encounter/${encounterId}/view`)
              }
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Back to View
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-700 font-medium">
              Loading encounter details...
            </p>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {!loading && !error && encounter && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm">
              <h2 className="text-xl font-bold text-black text-center mb-5">
                Edit Encounter #{encounter.encounterId}
              </h2>

              <p className="text-gray-900 font-semibold text-base">
                Patient: {encounter.patientName || "—"}
              </p>
              <p className="text-gray-900 font-semibold text-base mt-2">
                Doctor: {encounter.doctorName || "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
