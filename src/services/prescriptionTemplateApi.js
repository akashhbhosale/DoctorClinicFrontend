
import http from "../api/http";

// ===================== PRESCRIPTION TEMPLATES =====================

// Create template
export const createPrescriptionTemplate = (payload) =>
  http.post("/api/prescription-templates", payload);

// Get all templates belonging to the authenticated doctor
export const getPrescriptionTemplates = () =>
  http.get("/api/prescription-templates");

// Get template by ID
export const getPrescriptionTemplateById = (templateId) =>
  http.get(`/api/prescription-templates/${templateId}`);

// Update template
export const updatePrescriptionTemplate = (templateId, payload) =>
  http.put(`/api/prescription-templates/${templateId}`, payload);

// Delete template
export const deletePrescriptionTemplate = (templateId) =>
  http.delete(`/api/prescription-templates/${templateId}`);
