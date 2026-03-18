import { useParams } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DefaultPatientSidebar from "./DefaultPatientSidebar";
import PatientSidebar from "./PatientSidebar";
import { usePatient } from "../context/PatientContext";

export default function LeftSidebar() {
  const { activePatient } = usePatient();
  console.log("Sidebar patient:", activePatient);

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg p-5 space-y-6 h-fit sticky top-6">
      {/* Doctor Info */}
      <DoctorSidebar />

      {/* Patient Section */}
      {activePatient ? <PatientSidebar /> : <DefaultPatientSidebar />}
    </div>
  );
}
