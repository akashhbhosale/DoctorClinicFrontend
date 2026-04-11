import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

// Complaints
export const addEncounterComplaint = (payload) =>
  api.post("/encounter-complaints", payload);

export const getChiefComplaints = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/chief-complaints/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/chief-complaints", {
        params: { page, size },
      });

// Diagnosis
export const addEncounterDiagnosis = (payload) =>
  api.post("/encounter-diagnosis", payload);

export const getIcdCodes = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/icd-codes/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/icd-codes", {
        params: { page, size },
      });

// Procedure
export const addEncounterProcedure = (payload) =>
  api.post("/encounter-procedure", payload);

export const getProcedures = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/procedures/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/procedures", {
        params: { page, size, sortBy: "name", sortDir: "asc" },
      });

// Procedure Site
export const getProcedureSites = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/procedure-sites/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/procedure-sites", {
        params: { page, size },
      });

// Procedure Device
export const getProcedureDevices = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/procedure-devices/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/procedure-devices", {
        params: { page, size },
      });

// Procedure Method
export const getProcedureMethods = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/procedure-methods/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/procedure-methods", {
        params: { page, size },
      });

// Notes
export const updateEncounterNotes = (encounterId, payload) =>
  api.put(`/encounters/${encounterId}/notes`, payload);

// Delete
export const deleteEncounterComplaint = (id) =>
  api.delete(`/encounter-complaints/${id}`);

export const deleteEncounterDiagnosis = (id) =>
  api.delete(`/encounter-diagnosis/${id}`);

export const deleteEncounterProcedure = (id) =>
  api.delete(`/encounter-procedure/${id}`);

// Encounter details
export const getEncounterDetails = (encounterId) =>
  api.get(`/encounters/${encounterId}/details`);

export const createEncounter = (payload) => api.post("/encounters", payload);

export const deleteEncounter = (encounterId) =>
  api.delete(`/encounters/${encounterId}`);