import VisitPage from "../components/VisitPage";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Encounter from "../pages/Encounter.jsx";
import Assessment from "../pages/Assessment.jsx";
import History from "../pages/History.jsx";
import Nursing from "../pages/Nursing.jsx";
import Allergies from "../pages/Allergies.jsx";
import Medication from "../pages/Medication.jsx";
import PatientsList from "../pages/Patients/AllPatients.jsx";
import AddPatient from "../pages/Patients/AddPatient.jsx";
import ArchivedPatients from "../pages/Patients/ArchivedPatients.jsx";
import ViewPatient from "../pages/Patients/ViewPatient";
import EditPatient from "../pages/Patients/EditPatient";
import EncounterHistory from "../pages/Encounter/EncounterHistory.jsx";
import ViewEncounter from "../pages/Encounter/ViewEncounter.jsx";
import NursingHistory from "../pages/NursingHistory.jsx";
import AssessmentHistory from "../pages/AssessmentHistory.jsx";
import MedicationHistory from "../pages/MedicationHistory.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import PatientLayout from "../components/PatientLayout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/encounter" element={<VisitPage page={Encounter} />} />
        <Route path="/assessment" element={<VisitPage page={Assessment} />} />
        <Route path="/history" element={<VisitPage page={History} patientPage />} />
        <Route path="/nursing" element={<VisitPage page={Nursing} />} />
        <Route path="/allergies" element={<VisitPage page={Allergies} patientPage />} />
        <Route path="/medication" element={<VisitPage page={Medication} />} />

        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<AddPatient />} />
        <Route path="/patients/archived" element={<ArchivedPatients />} />

        <Route path="/patients/:id" element={<PatientLayout />}>
          <Route index element={<ViewPatient />} />
          <Route path="history" element={<VisitPage page={History} patientPage />} />
          <Route path="encounter" element={<VisitPage page={Encounter} />} />
          <Route path="encounters" element={<EncounterHistory />} />
          <Route path="nursing" element={<VisitPage page={Nursing} />} />
          <Route path="nursing-history" element={<NursingHistory />} />
          <Route path="allergies" element={<VisitPage page={Allergies} patientPage />} />
          <Route path="assessment" element={<VisitPage page={Assessment} />} />
          <Route path="assessment-history" element={<AssessmentHistory />} />
          <Route path="medication" element={<VisitPage page={Medication} />} />
          <Route path="medication-history" element={<MedicationHistory />} />
          <Route path="encounter/:encounterId/view"
            element={<ViewEncounter />}
          />
          <Route path="encounter/:encounterId/edit" element={<VisitPage page={Encounter} />} />
          <Route path="encounter/:encounterId/edit/history" element={<VisitPage page={History} />} />
          <Route path="encounter/:encounterId/edit/assessment" element={<VisitPage page={Assessment} />} />
          <Route path="encounter/:encounterId/edit/allergies" element={<VisitPage page={Allergies} />} />
          <Route path="encounter/:encounterId/edit/medication" element={<VisitPage page={Medication} />} />
          <Route path="encounter/:encounterId/edit/nursing" element={<VisitPage page={Nursing} />} />
          <Route path="encounter/:encounterId" element={<VisitPage page={Encounter} />} />
        </Route>

        <Route path="/patients/edit/:id" element={<EditPatient />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
