import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reopenVisit } from "../services/encounterApi";

export default function EditEncounterButton({ patientId, encounterId }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function edit() {
    setBusy(true);
    try {
      await reopenVisit(patientId, encounterId);
      navigate(`/patients/${patientId}/encounter/${encounterId}/edit`);
    } catch (error) {
      alert(error.response?.status === 409
        ? "This patient has another open encounter. Complete it on Nursing before editing this visit."
        : "Could not open this encounter for editing. Check your connection and doctor account.");
    } finally {
      setBusy(false);
    }
  }

  return <button type="button" disabled={busy} onClick={edit}
    className="rounded-lg border border-blue-500 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50">
    {busy ? "Opening…" : "Edit Encounter"}
  </button>;
}
