import { useState } from "react";
import { deleteEncounter } from "../services/encounterApi";

export default function DeleteEncounterButton({ encounterId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm(event) {
    event.preventDefault();
    if (busy || !reason.trim()) return;
    setBusy(true);
    try {
      await deleteEncounter(encounterId, reason.trim());
      setOpen(false);
      await onDeleted();
    } catch {
      setError("Could not confirm deletion. Refresh the history or try again.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      onClick={() => { setOpen(true); setReason(""); setError(""); }}>Delete Encounter</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form role="dialog" aria-label="Delete encounter" aria-modal="true" onSubmit={confirm}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6">
        <h2 className="text-lg font-semibold">Delete encounter #{encounterId}?</h2>
        <p>This removes the visit from patient history. The original record is retained.</p>
        <label className="block">Reason for removal
          <textarea autoFocus required maxLength={500} value={reason} disabled={busy}
            onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
          <button type="submit" disabled={busy || !reason.trim()} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">
            {busy ? "Removing…" : "Confirm deletion"}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
