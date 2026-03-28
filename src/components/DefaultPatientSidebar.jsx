import SectionHeader from "./SectionHeader";

export default function DefaultPatientSidebar() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      {/* Section Header */}
      <SectionHeader
        title="Patient Information"
        variant="compact"
        align="center"
      />

      {/* Content */}
      <div className="p-4 space-y-3 text-sm">

        <div>
          <span className="text-gray-500 font-medium">
            Status
          </span>
          <p className="text-gray-900 font-semibold mt-1">
            No Patient Selected
          </p>
        </div>

        <div className="text-gray-500 text-sm">
          Please select a patient from the list to view clinical details.
        </div>

      </div>

    </div>
  );
}