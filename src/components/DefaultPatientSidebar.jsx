import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";

export default function DefaultPatientSidebar() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <SectionHeader
        title="Patient Information"
        variant="compact"
        align="center"
      />

      <div className="p-4 space-y-3 text-sm">
        <div>
          <span className="text-gray-500 font-medium">Status</span>
          <p className="text-gray-900 font-semibold mt-1">
            No Patient Selected
          </p>
        </div>

        <div className="text-gray-500 text-sm leading-6">
          Please select a patient from the list to view clinical details.
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
          <button
            onClick={() => navigate("/patients")}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <Users className="w-4 h-4" />
            Show Patient List
          </button>

          <button
            onClick={() => navigate("/patients/new")}
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-500 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add New Patient
          </button>
        </div>
      </div>
    </div>
  );
}