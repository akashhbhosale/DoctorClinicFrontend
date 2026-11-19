import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

// Attach JWT to every request (backend enforces authentication on all
// endpoints except /api/auth/**)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== MASTER LISTS (unchanged) =====================

export const getNursingAssessments = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-assessments/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-assessments", { params: { page, size } });

export const getNursingDiagnoses = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-diagnoses/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-diagnoses", { params: { page, size } });

export const getNursingOutcomes = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-outcomes/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-outcomes", { params: { page, size } });

export const getNursingInterventions = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-interventions/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-interventions", { params: { page, size } });

// ===================== NURSING ASSESSMENT RECORDS (NEW) =====================
// One Assessment + Diagnosis + Outcome per record. Each record then holds
// many timestamped interventions underneath it.

export const addNursingAssessmentRecord = (payload) =>
  api.post("/nursing-assessment-record", payload);

export const getNursingAssessmentRecords = (encounterId) =>
  api.get(`/nursing-assessment-record/${encounterId}`);

export const deleteNursingAssessmentRecord = (id) =>
  api.delete(`/nursing-assessment-record/${id}`);

// All records (with nested interventions) across every encounter — for the
// Nursing History page.
export const getNursingHistoryByPatient = (patientId) =>
  api.get(`/nursing-assessment-record/patient/${patientId}`);

// ===================== NURSING INTERVENTION ENTRIES (NEW) =====================

export const addNursingInterventionEntry = (payload) =>
  api.post("/nursing-intervention-entry", payload);

export const deleteNursingInterventionEntry = (id) =>
  api.delete(`/nursing-intervention-entry/${id}`);
