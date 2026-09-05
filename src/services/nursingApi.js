import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

// Nursing Assessment master
export const getNursingAssessments = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-assessments/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-assessments", {
        params: { page, size },
      });

// Nursing Diagnosis master
export const getNursingDiagnoses = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-diagnoses/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-diagnoses", {
        params: { page, size },
      });

// Nursing Outcome master
export const getNursingOutcomes = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-outcomes/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-outcomes", {
        params: { page, size },
      });

// Nursing Intervention master
export const getNursingInterventions = (search = "", page = 0, size = 20) =>
  search.trim()
    ? api.get("/nursing-interventions/search", {
        params: { keyword: search, page, size },
      })
    : api.get("/nursing-interventions", {
        params: { page, size },
      });

// Encounter Nursing (transaction)
export const addEncounterNursing = (payload) =>
  api.post("/encounter-nursing", payload);

export const getEncounterNursing = (encounterId) =>
  api.get(`/encounter-nursing/${encounterId}`);

export const deleteEncounterNursing = (id) =>
  api.delete(`/encounter-nursing/${id}`);
