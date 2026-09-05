import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

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