import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import ConfirmModal from "../../components/ConfirmModal";
import { useLocation } from "react-router-dom";

export default function AllPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "";
      const trimmedSearch = search.trim();

      if (trimmedSearch === "") {
        url = `http://localhost:8080/api/patients?page=${page}&size=${size}`;
      } else {
        url = `http://localhost:8080/api/patients/search?query=${trimmedSearch}&page=${page}&size=${size}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setPatients(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleSearch = () => {
    setPage(0);
  };

  useEffect(() => {
    fetchPatients();
  }, [page, size, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;

    try {
      await fetch(`http://localhost:8080/api/patients/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchPatients();
    } catch (error) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");

    if (searchParam) {
      setSearch(searchParam);
      setPage(0);
    }
  }, [location.search]);

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:8080/api/patients/delete/${selectedPatient.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsModalOpen(false);
      setSelectedPatient(null);
      fetchPatients(); // refresh list
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

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
                onChange={(e) => setSearch(e.target.value)}
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
                {patients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-t hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {patient.abhaId}
                    </td>
                    <td className="px-6 py-3">{patient.fullName}</td>
                    <td className="px-6 py-3">{patient.phoneNo}</td>
                    <td className="px-6 py-3">{patient.gender}</td>
                    <td className="px-6 py-3 flex gap-2">
                      <button className="text-blue-600 hover:underline">
                        View
                      </button>
                      <button className="text-green-600 hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsModalOpen(true);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
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
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
}
