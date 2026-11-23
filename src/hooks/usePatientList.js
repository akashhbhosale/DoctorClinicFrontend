import { useEffect, useState } from "react";
import http from "../api/http";

export function patientError(error, fallback) {
  if (error.response?.status === 403) return "Administrator access is required to manage archived patients.";
  if (error.response?.status === 401) return "Your session has expired. Please sign in again.";
  return fallback;
}

export default function usePatientList(archived, search = "") {
  const [page, setPage] = useState(0);
  const [patients, setPatients] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = { page, size: 10 };
    let path = "/api/patients";
    if (archived) path += "/archived";
    else if (search.trim()) {
      path += "/search";
      params.query = search;
    }
    setLoading(true);
    setError("");
    http.get(path, { params, signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      const last = Math.max(0, data.totalPages - 1);
      if (page > last) { setPage(last); return; }
      setPatients(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    }).catch(error => {
      if (controller.signal.aborted) return;
      setPatients([]);
      setTotalPages(0);
      setError(patientError(error, "Could not load patients. Please try again."));
      setLoading(false);
    });
    return () => controller.abort();
  }, [archived, search, page, version]);

  return { patients, page, setPage, totalPages, loading, error, refresh: () => setVersion(v => v + 1) };
}
