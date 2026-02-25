import { useLocation, matchPath } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DefaultPatientSidebar from "./DefaultPatientSidebar";
import PatientSidebar from "./PatientSidebar";

export default function LeftSidebar() {
  const location = useLocation();

  const isPatientDetail = matchPath(
    { path: "/patients/:id" },
    location.pathname
  );

  const isPatientEdit = matchPath(
    { path: "/patients/edit/:id" },
    location.pathname
  );

  const showPatientSidebar = isPatientDetail || isPatientEdit;

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg p-5 space-y-6 h-fit sticky top-6">
      {/* Doctor Section */}
      <DoctorSidebar />
      
      {/* Patient Section */}
      {showPatientSidebar ? <PatientSidebar /> : <DefaultPatientSidebar />}
    </div>
  );
}
