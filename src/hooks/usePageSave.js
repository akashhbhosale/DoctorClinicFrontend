import { useEffect, useRef, useState } from "react";
import { editStepPath } from "../routes/editEncounterPath";
import { useLocation, useNavigate } from "react-router-dom";

export default function usePageSave(nextPage) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function runSave(save, advance = false) {
    if (locked.current) return;
    locked.current = true;
    setSaving(true);
    try {
      const saved = await save();
      if (saved && advance && mounted.current) navigate(editStepPath(pathname, nextPage));
    } finally {
      locked.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return { saving, runSave };
}
