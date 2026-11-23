import usePatientList, { patientError } from "../../hooks/usePatientList";
import http from "../../api/http";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import ConfirmModal from "../../components/ConfirmModal";
import { useLocation } from "react-router-dom";
import { usePatient } from "../../context/PatientContext";

export default function AllPatients() {
  const navigate = useNavigate();

  const location = useLocation();
  const search = new URLSearchParams(location.search).get("search") || "";
  const { setActivePatient } = usePatient();
  const { patients, page, setPage, totalPages, loading, error, refresh } = usePatientList(false, search);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);

  async function confirmAction() {
    if (saving || !selectedPatient) return;
    setSaving(true);
    try {
      await http.delete(`/api/patients/delete/${selectedPatient.id}`);
      setActivePatient(current => String(current?.id) === String(selectedPatient.id) ? null : current);
      setIsModalOpen(false);
      setSelectedPatient(null);
      refresh();
    } catch (error) {
      window.alert(patientError(error, "The change could not be confirmed. Refresh the list and try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <SectionHeader title="All Patients" />

        <div className="p-6 space-y-6">
          {/* SEARCH + ADD */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search by Name, ABHA or Mobile..."
                value={search}
                onChange={(e) => {
                  setPage(0);
                  navigate(
                    `/patients?search=${encodeURIComponent(e.target.value)}`
                  );
                }}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => navigate("/patients/new")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg 
               hover:bg-blue-700 shadow-sm"
            >
              + Add Patient
            </button>
          </div>

          {loading && <p role="status">Loading patients…</p>}
          {error && <p role="alert">{error} <button onClick={refresh} className="underline">Retry</button></p>}
          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3">ABHA ID</th>
                  <th className="px-6 py-3">Full Name</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {!loading && patients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-t hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {patient.abhaId}
                    </td>
                    <td
                      className="px-6 py-3 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => {
                        setActivePatient(patient);
                        navigate(`/patients/${patient.id}`);
                      }}
                    >
                      {patient.fullName}
                    </td>
                    <td className="px-6 py-3">{patient.phoneNo}</td>
                    <td className="px-6 py-3">{patient.gender}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => {
                            setActivePatient(patient); // 🔥 Set in sidebar
                            navigate(`/patients/${patient.id}`); // optional
                          }}
                          className="px-3 py-1 text-sm rounded-md 
      bg-blue-100 text-blue-700 
      hover:bg-blue-200 
      transition duration-200"
                        >
                          View
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() =>
                            navigate(`/patients/edit/${patient.id}`)
                          }
                          className="px-3 py-1 text-sm rounded-md 
      bg-green-100 text-green-700 
      hover:bg-green-200 
      transition duration-200"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 text-sm rounded-md 
      bg-red-100 text-red-700 
      hover:bg-red-200 
      transition duration-200"
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">
            <span className="text-sm text-slate-600">
              {totalPages > 0 ? `Showing page ${page + 1} of ${totalPages}` : ""}
            </span>

            <div className="flex gap-2">
              <button
                disabled={loading || page === 0}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={loading || page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal for delete*/}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        busy={saving}
        onConfirm={confirmAction}
        title="Archive Patient"
        confirmLabel="Archive"
        message={`Archive ${selectedPatient?.fullName} (ID ${selectedPatient?.id})? Their encounters are retained. You can restore them from Archived Patients.`}
      />
    </div>
  );
}
