import SectionHeader from "./SectionHeader";
import { usePatient } from "../context/PatientContext";

export default function PatientSidebar() {
  console.log("PatientSidebar rendered");

  const { activePatient } = usePatient();

  console.log("Sidebar patient:", activePatient);

  // 🔹 Loading state
  if (!activePatient) {
    return (
      <div className="p-4 text-gray-500">
        Loading patient...
      </div>
    );
  }

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
          <p className="text-gray-900 font-semibold text-base mt-1">
            {activePatient.fullName}
          </p>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">ABHA ID</span>
          <span className="text-gray-900 font-semibold">
            {activePatient.abhaId}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Gender</span>
          <span className="text-gray-900 font-semibold">
            {activePatient.gender}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Age</span>
          <span className="text-gray-900 font-semibold">
            {activePatient.age}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Blood Group</span>
          <span className="text-gray-900 font-semibold">
            {activePatient.bloodGroup}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Phone</span>
          <span className="text-gray-900 font-semibold">
            {activePatient.phoneNo}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Email</span>
          <p className="text-gray-900 font-semibold">
            {activePatient.email}
          </p>
        </div>

        <div>
          <span className="text-gray-500 font-medium">Address</span>
          <p className="text-gray-900 font-semibold mt-1">
            {activePatient.address}
          </p>
        </div>
      </div>
    </div>
  );
}