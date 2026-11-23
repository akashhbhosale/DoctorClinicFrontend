import { Link } from "react-router-dom";
import { ClipboardPlus, History } from "lucide-react";

export default function StartEncounterRequired({ patient, encounterId, onStart, disabled, status }) {
  const button = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium shadow-sm";
  return (
    <section aria-label="Patient encounters" className="mx-6 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{patient.fullName} · Patient ID {patient.id}</h2>
        <p role="status" className="text-sm text-slate-600">{status}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onStart} disabled={disabled || encounterId != null}
          className={button + " bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"}>
          <ClipboardPlus aria-hidden="true" className="h-5 w-5" />
          Start New Encounter
        </button>
        <Link to={`/patients/${encodeURIComponent(patient.id)}/encounters`}
          className={button + " border border-blue-500 bg-white text-blue-600 hover:bg-blue-50"}>
          <History aria-hidden="true" className="h-5 w-5" />
          Encounter History
        </Link>
      </div>
    </section>
  );
}
