import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";

export default function PatientSelectionRequired({
  title = "Please select a patient",
  message = "No patient is currently selected. Please choose a patient from the patient list or add a new patient to continue.",
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-10 md:px-10 md:py-14">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
            <Users className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">{title}</h2>

          <p className="text-slate-500 text-base leading-7 mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/patients")}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition font-medium min-w-[190px]"
            >
              <Users className="w-5 h-5" />
              Show Patient List
            </button>

            <button
              onClick={() => navigate("/patients/new")}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-500 px-6 py-3 rounded-xl hover:bg-blue-50 shadow-sm transition font-medium min-w-[190px]"
            >
              <UserPlus className="w-5 h-5" />
              Add New Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}