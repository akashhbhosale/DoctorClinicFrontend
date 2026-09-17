import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { usePatient } from "../context/PatientContext";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import {
  getAssessmentHistoryByPatient,
  viewEncounterLaboratoryFile,
  viewEncounterRadiologyFile,
} from "../services/assessmentApi";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const openFileBlob = async (fetchFn, fileId, fallbackErrorMessage, setViewingFileId) => {
  try {
    setViewingFileId(fileId);
    const res = await fetchFn(fileId);
    const blobUrl = window.URL.createObjectURL(res.data);
    window.open(blobUrl, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    console.error("View file error:", error?.response?.data || error);
    alert(fallbackErrorMessage);
  } finally {
    setViewingFileId(null);
  }
};

function FileList({ files, fetchFn, viewingFileId, setViewingFileId, errorMessage }) {
  if (!files || files.length === 0) {
    return <p className="text-xs text-slate-400 mt-1">No file attached</p>;
  }

  return (
    <div className="mt-2 space-y-1">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-2">
          <span className="text-xs text-slate-500 truncate max-w-[160px]">
            {file.originalFileName}
          </span>
          <button
            onClick={() =>
              openFileBlob(fetchFn, file.id, errorMessage, setViewingFileId)
            }
            disabled={viewingFileId === file.id}
            className="text-xs rounded-md bg-blue-600 text-white px-2 py-0.5 hover:bg-blue-700 disabled:opacity-50"
          >
            {viewingFileId === file.id ? "Opening..." : "View"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AssessmentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingFileId, setViewingFileId] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    getAssessmentHistoryByPatient(patientId)
      .then((res) => setHistory(res.data || []))
      .catch((error) => {
        console.error("Load assessment history error:", error?.response?.data || error);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before viewing assessment history."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Assessment History" />

        <div className="p-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 font-medium">
              Vitals, Laboratory, Radiology, and Observation records across
              every encounter for this patient.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="bg-white text-blue-900 border border-blue-900 px-5 py-2 rounded-lg hover:bg-blue-50 shadow-sm transition font-medium"
            >
              ← Back
            </button>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Loading assessment history...</p>
          )}

          {!loading && history.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center text-slate-400">
              No assessment records found for this patient.
            </div>
          )}

          {!loading &&
            history.map((entry) => {
              const hasAnything =
                entry.vitals ||
                (entry.laboratory && entry.laboratory.length > 0) ||
                (entry.radiology && entry.radiology.length > 0) ||
                (entry.observations && entry.observations.length > 0);

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
                        No assessment data recorded for this encounter.
                      </p>
                    )}

                    {/* VITALS */}
                    {entry.vitals && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Vitals
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Blood Pressure</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.systolicBp ?? "-"}/
                              {entry.vitals.diastolicBp ?? "-"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Pulse</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.pulseRate ?? "-"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Respiratory Rate</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.respiratoryRate ?? "-"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">SpO2</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.spo2 ?? "-"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Height</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.height ?? "-"} cm
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Weight</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.weight ?? "-"} kg
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-400">Temperature</p>
                            <p className="font-medium text-slate-800">
                              {entry.vitals.temperature ?? "-"}°
                              {entry.vitals.tempUnit || "C"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LABORATORY */}
                    {entry.laboratory && entry.laboratory.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Laboratory
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 text-left">Test</th>
                                <th className="px-4 py-2 text-left">Result</th>
                                <th className="px-4 py-2 text-left">Report</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.laboratory.map((lab) => (
                                <tr key={lab.id} className="border-t">
                                  <td className="px-4 py-2">{lab.testName}</td>
                                  <td className="px-4 py-2">{lab.labResult || "-"}</td>
                                  <td className="px-4 py-2">
                                    <FileList
                                      files={lab.files}
                                      fetchFn={viewEncounterLaboratoryFile}
                                      viewingFileId={viewingFileId}
                                      setViewingFileId={setViewingFileId}
                                      errorMessage="Failed to open lab report"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* RADIOLOGY */}
                    {entry.radiology && entry.radiology.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Radiology
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 text-left">Order</th>
                                <th className="px-4 py-2 text-left">Impression</th>
                                <th className="px-4 py-2 text-left">Report</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.radiology.map((rad) => (
                                <tr key={rad.id} className="border-t">
                                  <td className="px-4 py-2">{rad.orderName}</td>
                                  <td className="px-4 py-2">
                                    {rad.radiologyResult || "-"}
                                  </td>
                                  <td className="px-4 py-2">
                                    <FileList
                                      files={rad.files}
                                      fetchFn={viewEncounterRadiologyFile}
                                      viewingFileId={viewingFileId}
                                      setViewingFileId={setViewingFileId}
                                      errorMessage="Failed to open radiology report"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* OBSERVATIONS */}
                    {entry.observations && entry.observations.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                          Assessment / Observation
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 text-left">Observation</th>
                                <th className="px-4 py-2 text-left">Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.observations.map((obs) => (
                                <tr key={obs.id} className="border-t">
                                  <td className="px-4 py-2">
                                    {obs.observationName}
                                  </td>
                                  <td className="px-4 py-2">
                                    {obs.assessmentResult || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
