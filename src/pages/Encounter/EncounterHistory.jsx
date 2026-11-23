import EditEncounterButton from "../../components/EditEncounterButton";
import PrescriptionPaper from "../../components/PrescriptionPaper";
import { useDoctor } from "../../context/DoctorContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePatient } from "../../context/PatientContext";
import SectionHeader from "../../components/SectionHeader";
import {
  getEncounterDetails,
  getEncountersByPatient,
} from "../../services/encounterApi";
import DeleteEncounterButton from "../../components/DeleteEncounterButton";

export default function EncounterHistory() {
  const [printId, setPrintId] = useState(null);
  const { doctor } = useDoctor();
  const { id } = useParams();
  const navigate = useNavigate();
  const { activePatient } = usePatient();

  const patientId = activePatient?.id || id;

  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const startNewEncounter = () => {
    navigate(`/patients/${patientId}/encounter`);
  };

  const loadEncounterHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getEncountersByPatient(patientId);

      setEncounters(res.data || []);
    } catch (err) {
      console.error("Error loading encounter history:", err);
      setError("Failed to load encounter history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadEncounterHistory();
    }
  }, [patientId]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "—";
    return new Date(dateTime).toLocaleString();
  };

  const getNotesPreview = (notes) => {
    if (!notes) return "No notes added";
    return notes.length > 120 ? `${notes.slice(0, 120)}...` : notes;
  };


  return (
    <div className="min-h-screen bg-slate-100 p-6 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader title="Encounter History" />

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                View all previous encounters for this patient.
              </p>
            </div>

            <button
              onClick={startNewEncounter}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition font-medium"
            >
              Open Encounter
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-700 font-medium">
              Loading encounter history...
            </p>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {!loading && !error && encounters.length === 0 && (
            <div className="border rounded-xl p-6 text-center text-gray-700 text-sm font-medium bg-slate-50 border-slate-200">
              No previous encounters found for this patient.
            </div>
          )}

          {!loading && !error && encounters.length > 0 && (
            <div className="space-y-4">
              {encounters.map((encounter, index) => (
                <div
                  key={encounter.id}
                  className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm hover:shadow-md transition"
                >
                  {/* Heading */}
                  <h2 className="text-xl font-bold text-black text-center mb-5">
                    Encounter {encounters.length - index} {encounter.visitStatus && (" — " + encounter.visitStatus.replace("_", " "))}
                  </h2>

                  {/* Horizontal info row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 font-medium text-sm">
                        Encounter ID
                      </span>
                      <p className="text-gray-900 font-semibold text-base mt-1">
                        {encounter.id}
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

                    <div>
                      <span className="text-gray-500 font-medium text-sm">
                        Doctor
                      </span>
                      <p className="text-gray-900 font-semibold text-base mt-1">
                        {encounter.doctorName ||
                          `Doctor ID: ${encounter.doctorId}`}
                      </p>
                    </div>

                    <div className="self-end">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/patients/${patientId}/encounter/${encounter.id}/view`
                            )
                          }
                          className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition font-medium"
                        >
                          View
                        </button>

                        {encounter.visitStatus && encounter.doctorId === doctor?.id &&
                          <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-800" onClick={() => setPrintId(encounter.id)}>Preview Encounter Summary</button>}
                        {encounter.visitStatus === "IN_PROGRESS" && encounter.doctorId === doctor?.id &&
                          <button onClick={startNewEncounter}>Resume Encounter</button>}
                        {encounter.visitStatus !== "COMPLETED" && doctor?.id && String(encounter.doctorId) === String(doctor.id) &&
                          <EditEncounterButton patientId={patientId} encounterId={encounter.id} />}

                        {doctor?.id && String(encounter.doctorId) === String(doctor.id) &&
                          <DeleteEncounterButton encounterId={encounter.id} onDeleted={loadEncounterHistory} />}
                      </div>
                    </div>
                  </div>

                  {/* Notes below */}
                  <div className="border-t border-slate-200 pt-4">
                    <span className="text-gray-500 font-medium text-sm">
                      Notes
                    </span>
                    <p className="text-gray-900 font-semibold text-base mt-1 leading-relaxed">
                      {getNotesPreview(encounter.notes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {printId && doctor && activePatient && <PrescriptionPaper summary encounterId={printId}
        patient={activePatient} doctor={doctor} onClose={() => setPrintId(null)} />}

    </div>
  );
}
