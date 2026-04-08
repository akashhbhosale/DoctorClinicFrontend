import SectionHeader from "./SectionHeader";
import { useDoctor } from "../context/DoctorContext";

export default function DoctorSidebar() {
  const { doctor, loading, error } = useDoctor();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-gray-700">
        Loading doctor information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

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
            {doctor?.fullName}
          </p>
        </div>

        <div>
          <span className="text-gray-500 font-medium">Email</span>
          <p className="text-gray-900 font-semibold text-base mt-1">
            {doctor?.email}
          </p>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Registration No</span>
          <span className="text-gray-900 font-semibold">
            {doctor?.registrationNo}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Qualification</span>
          <span className="text-gray-900 font-semibold">
            {doctor?.qualification}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Speciality</span>
          <span className="text-gray-900 font-semibold">
            {doctor?.speciality}
          </span>
        </div>
      </div>
    </div>
  );
}