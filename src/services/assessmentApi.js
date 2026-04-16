import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

export const getEncounterVitals = (encounterId) =>
  api.get(`/assessment/vitals/${encounterId}`);

export const saveEncounterVitals = (encounterId, payload) =>
  api.put(`/assessment/vitals/${encounterId}`, payload);