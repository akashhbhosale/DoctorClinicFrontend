import DoctorInfo from "./DoctorInfo";

export default function LeftSidebar() {
  return (
    <div className="w-full md:w-1/4 space-y-6">
      <DoctorInfo />
      {/* PatientInfo will come in Step-2 */}
    </div>
  );
}
