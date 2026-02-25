import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "./SectionHeader";

export default function PatientSidebar() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error("Sidebar patient fetch error:", error);
    }
  };

  if (!patient) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Section Header */}
      <SectionHeader
        title="Patient Information"
        variant="compact"
        align="center"
      />

      {/* Content Area */}
      <div className="p-6 space-y-4 text-sm">
        <div>
          <span className="text-gray-500 font-medium">Name</span>
          <p className="text-gray-900 font-semibold text-base mt-1">{patient.fullName}</p>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">ABHA ID</span>
          <span className="text-gray-900 font-semibold">{patient.abhaId}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Gender</span>
          <span className="text-gray-900 font-semibold">{patient.gender}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Age</span>
          <span className="text-gray-900 font-semibold">{patient.age}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Blood Group</span>
          <span className="text-gray-900 font-semibold">
            {patient.bloodGroup}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Phone</span>
          <span className="text-gray-900 font-semibold">{patient.phoneNo}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Email</span>
          <span className="text-gray-900 font-semibold">{patient.email}</span>
        </div>

        <div>
          <span className="text-gray-500 font-medium">Address</span>
          <p className="text-gray-900 font-semibold mt-1">{patient.address}</p>
        </div>
      </div>
    </div>
  );
}
