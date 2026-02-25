import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";

export default function DoctorSidebar() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/doctors/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch doctor");
        }
        return res.json();
      })
      .then((data) => {
        setDoctor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* -------- Loading State -------- */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-gray-700">
        Loading doctor information...
      </div>
    );
  }

  /* -------- Error State -------- */
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  /* -------- Main UI -------- */
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      
      <SectionHeader
        title="Doctor Information"
        variant="compact"
        align="center"
      />
  
      <div className="p-6 space-y-4 text-sm">
  
        <div>
          <span className="text-gray-500 font-medium">Name</span>
          <p className="text-gray-900 font-semibold text-base mt-1">
            {doctor.username}
          </p>
        </div>
  
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">
            Registration No
          </span>
          <span className="text-gray-900 font-semibold">
            {doctor.registrationNo}
          </span>
        </div>
  
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">
            Qualification
          </span>
          <span className="text-gray-900 font-semibold">
            {doctor.qualification}
          </span>
        </div>
  
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">
            Speciality
          </span>
          <span className="text-gray-900 font-semibold">
            {doctor.speciality}
          </span>
        </div>
  
      </div>
    </div>
  );
}
