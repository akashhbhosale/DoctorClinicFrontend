import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== MASTERS =====================

export const getMedicineMaster = (type, search = "", page = 0, size = 20) =>
  api.get("/medicine-master", { params: { type, search, page, size } });

export const getDoseFormMaster = (search = "", page = 0, size = 20) =>
  api.get("/dose-form-master", { params: { search, page, size } });

export const getRouteOfAdministrationMaster = (search = "", page = 0, size = 20) =>
  api.get("/route-of-administration-master", { params: { search, page, size } });

export const getDirectionOfUseMaster = (search = "", page = 0, size = 20) =>
  api.get("/direction-of-use-master", { params: { search, page, size } });

export const getSurgeryMaster = (search = "", page = 0, size = 20) =>
  api.get("/surgery-master", { params: { search, page, size } });

// ===================== MEDICATION =====================

export const addEncounterMedication = (payload) =>
  api.post("/encounter-medication", payload);

export const getEncounterMedication = (encounterId) =>
  api.get(`/encounter-medication/${encounterId}`);

export const deleteEncounterMedication = (id) =>
  api.delete(`/encounter-medication/${id}`);

// ===================== SURGICAL TREATMENT =====================

export const addEncounterSurgicalTreatment = (payload) =>
  api.post("/encounter-surgical-treatment", payload);

export const getEncounterSurgicalTreatment = (encounterId) =>
  api.get(`/encounter-surgical-treatment/${encounterId}`);

export const deleteEncounterSurgicalTreatment = (id) =>
  api.delete(`/encounter-surgical-treatment/${id}`);

// ===================== FOLLOW UP =====================

export const saveEncounterFollowUp = (encounterId, payload) =>
  api.put(`/encounter-follow-up/${encounterId}`, payload);

export const getEncounterFollowUp = (encounterId) =>
  api.get(`/encounter-follow-up/${encounterId}`);
