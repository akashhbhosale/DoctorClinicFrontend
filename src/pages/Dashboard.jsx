// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  return (
    <div className="h-full flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to DoctorClinic</p>
        </div>

        {/* Token Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Token saved:</span>{" "}
            {token ? token.slice(0, 16) + "..." : "none"}
          </p>
        </div>

        {/* Example sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patients */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-700">Patients</h2>
            <p className="text-sm text-gray-500 mt-2">
              Manage patient records and view details.
            </p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              View Patients
            </button>
          </div>

          {/* Appointments */}
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-700">
              Appointments
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Schedule, track, and manage appointments.
            </p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Manage Appointments
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="text-center">
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
