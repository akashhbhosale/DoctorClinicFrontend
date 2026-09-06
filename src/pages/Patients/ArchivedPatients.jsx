import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import ConfirmModal from "../../components/ConfirmModal";

export default function ArchivedPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchArchivedPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/patients/archived?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setPatients(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching archived patients:", error);
    }
  };

  useEffect(() => {
    fetchArchivedPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRestoreConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:8080/api/patients/restore/${selectedPatient.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsModalOpen(false);
      setSelectedPatient(null);
      fetchArchivedPatients(); // refresh list
    } catch (error) {
      console.error("Error restoring patient:", error);
      alert("Restore failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <SectionHeader title="Archived Patients" />

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">
              Patients removed from the active list. Their records are kept intact
              and can be restored at any time.
            </p>

            <button
              onClick={() => navigate("/patients")}
              className="bg-slate-200 text-slate-700 px-5 py-2 rounded-lg
               hover:bg-slate-300 shadow-sm"
            >
              ← Back to Patients
            </button>
          </div>

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
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No archived patients.
                    </td>
                  </tr>
                )}

                {patients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-slate-500">
                      {patient.abhaId}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {patient.fullName}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{patient.phoneNo}</td>
                    <td className="px-6 py-3 text-slate-500">{patient.gender}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 text-sm rounded-md
      bg-green-100 text-green-700
      hover:bg-green-200
      transition duration-200"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">
              <span className="text-sm text-slate-600">
                Showing page {page + 1} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal for restore */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Patient"
        message={`Restore ${selectedPatient?.fullName}? They will reappear in your active patient list with all their records intact.`}
        confirmLabel="Restore"
        confirmClassName="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
}
