import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";

export default function AllPatients() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200">

        {/* -------- PAGE HEADER -------- */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">
            All Patients
          </h1>

          <button
            onClick={() => navigate("/add-patient")}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition"
          >
            + Add Patient
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">

          {/* -------- SEARCH + FILTER -------- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full md:w-80 rounded-lg border border-slate-300 px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40
                         focus:border-blue-500 transition"
            />

            {/* Page Size */}
            <select
              className="w-full md:w-40 rounded-lg border border-slate-300 px-4 py-2.5"
            >
              <option>10 per page</option>
              <option>20 per page</option>
              <option>50 per page</option>
            </select>
          </div>

          {/* -------- TABLE -------- */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">

            <table className="min-w-full text-sm text-left text-slate-700">

              <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {/* Placeholder Row */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">PAT-001</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Akash Bhosale</td>
                  <td className="px-4 py-3">Male</td>
                  <td className="px-4 py-3">28 Years</td>
                  <td className="px-4 py-3">AB+</td>
                  <td className="px-4 py-3">9876543210</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                    <button className="text-green-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

          {/* -------- PAGINATION -------- */}
          <div className="flex justify-between items-center pt-4">

            <p className="text-sm text-slate-500">
              Showing 1–10 of 50 patients
            </p>

            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100">
                Previous
              </button>
              <button className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100">
                Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
