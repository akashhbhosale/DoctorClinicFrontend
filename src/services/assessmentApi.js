import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

// Attach JWT to every request (backend enforces authentication on all
// endpoints except /api/auth/**). If your file already has this block,
// this replacement keeps it — nothing changes there.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEncounterVitals = (encounterId) =>
  api.get(`/assessment/vitals/${encounterId}`);

export const saveEncounterVitals = (encounterId, payload) =>
  api.put(`/assessment/vitals/${encounterId}`, payload);

// Laboratory master
export const getLaboratoryMaster = (search = "", page = 0, size = 20) =>
  api.get("/laboratory-master", {
    params: { search, page, size },
  });

// Laboratory transaction
export const addEncounterLaboratory = (payload) =>
  api.post("/assessment/laboratory", payload);

export const getEncounterLaboratory = (encounterId) =>
  api.get(`/assessment/laboratory/${encounterId}`);

export const deleteEncounterLaboratory = (laboratoryId) =>
  api.delete(`/assessment/laboratory/${laboratoryId}`);

export const uploadEncounterLaboratoryFile = (laboratoryId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/assessment/laboratory/${laboratoryId}/files`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getEncounterLaboratoryFiles = (laboratoryId) =>
  api.get(`/assessment/laboratory/${laboratoryId}/files`);

export const deleteEncounterLaboratoryFile = (fileId) =>
  api.delete(`/assessment/laboratory/files/${fileId}`);

// Fetches the raw file bytes (as a blob) so it can be opened/previewed in
// the browser. responseType: "blob" is required — without it axios would
// try to parse the PDF/image bytes as JSON and fail.
export const viewEncounterLaboratoryFile = (fileId) =>
  api.get(`/assessment/laboratory/files/${fileId}/view`, {
    responseType: "blob",
  });

// ===================== RADIOLOGY (NEW) =====================

// Radiology master
export const getRadiologyMaster = (search = "", page = 0, size = 20) =>
  api.get("/radiology-master", {
    params: { search, page, size },
  });

// Radiology transaction
export const addEncounterRadiology = (payload) =>
  api.post("/assessment/radiology", payload);

export const getEncounterRadiology = (encounterId) =>
  api.get(`/assessment/radiology/${encounterId}`);

export const deleteEncounterRadiology = (radiologyId) =>
  api.delete(`/assessment/radiology/${radiologyId}`);

export const uploadEncounterRadiologyFile = (radiologyId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/assessment/radiology/${radiologyId}/files`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getEncounterRadiologyFiles = (radiologyId) =>
  api.get(`/assessment/radiology/${radiologyId}/files`);

export const deleteEncounterRadiologyFile = (fileId) =>
  api.delete(`/assessment/radiology/files/${fileId}`);

// Same blob-fetch pattern as viewEncounterLaboratoryFile — needed for
// in-app preview instead of just listing the file name.
export const viewEncounterRadiologyFile = (fileId) =>
  api.get(`/assessment/radiology/files/${fileId}/view`, {
    responseType: "blob",
  });

// ===================== OBSERVATION / ASSESSMENT (NEW) =====================

// Observation master
export const getObservationMaster = (search = "", page = 0, size = 20) =>
  api.get("/observation-master", {
    params: { search, page, size },
  });

// Observation transaction
export const addEncounterObservation = (payload) =>
  api.post("/assessment/observation", payload);

export const getEncounterObservation = (encounterId) =>
  api.get(`/assessment/observation/${encounterId}`);

export const deleteEncounterObservation = (observationId) =>
  api.delete(`/assessment/observation/${observationId}`);

// ===================== ASSESSMENT HISTORY (NEW) =====================

// All Vitals/Laboratory/Radiology/Observation records for a patient,
// grouped by encounter, most recent encounter first.
export const getAssessmentHistoryByPatient = (patientId) =>
  api.get(`/assessment/history/patient/${patientId}`);
