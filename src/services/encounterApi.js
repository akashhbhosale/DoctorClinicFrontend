import axios from "axios"; // To connect With Backend API

const api = axios.create({ baseURL: "http://localhost:8080/api" });

// To connect with backend and addEncounterComplaint
export const addEncounterComplaint = (payload) =>
  api.post("/encounter-complaints", payload);

// To get details of ChiefComplaints for dropdown
export const getChiefComplaints = (search = "", page = 0, size = 20) =>
  api.get("/chief-complaints", { params: { search, page, size } });

// To connect with backend and addEncounterDiagnosis
export const addEncounterDiagnosis = (payload) =>
  api.post("/encounter-diagnosis", payload);

// To load diagnosis list from backend
export const getIcdCodes = (search = "", page = 0, size = 20) =>
  api.get("/icd-codes", { params: { search, page, size } });

// To connect with backend and addEncounterProcedure
export const addEncounterProcedure = (payload) =>
  api.post("/encounter-procedure", payload);

// To load procedure master list from backend
export const getProcedures = (search = "", page = 0, size = 20) =>
  api.get("/procedures", {
    params: { search, page, size },
  });

// To connect with backend and updateEncounterNotes
export const updateEncounterNotes = (encounterId, payload) =>
  api.put("/encounters/${encounterId}/notes", payload);

// To connect with backend and deleteEncounterComplaint
export const deleteEncounterComplaint = (id) =>
  api.delete("/encounter-complaints/${id}");

// To connect with backend and deleteEncounterDiagnosis
export const deleteEncounterDiagnosis = (id) =>
  api.delete("/encounter-diagnosis/${id}");

// To connect with backend and deleteEncounterProcedure
export const deleteEncounterProcedure = (id) =>
  api.delete("/encounter-procedure/${id}");

// To get Whole details
export const getEncounterDetails = (encounterId) =>
  api.get("/encounters/${encounterId}/details");

// To create whole Encounter
export const createEncounter = (payload) => api.post("/encounters", payload);
