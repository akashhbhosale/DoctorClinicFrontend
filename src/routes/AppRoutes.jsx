import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Encounter from "../pages/Encounter.jsx";
import Assessment from "../pages/Assessment.jsx";
import History from "../pages/History.jsx";
import Nursing from "../pages/Nursing.jsx";
import PatientsList from "../pages/Patients/AllPatients.jsx";
import AddPatient from "../pages/Patients/AddPatient.jsx";
import ViewPatient from "../pages/Patients/ViewPatient";
import EditPatient from "../pages/Patients/EditPatient";
import EncounterHistory from "../pages/Encounter/EncounterHistory.jsx";
import ViewEncounter from "../pages/Encounter/ViewEncounter.jsx";
import EditEncounter from "../pages/Encounter/EditEncounter.jsx";

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
        <Route path="/encounter" element={<Encounter />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/history" element={<History />} />
        <Route path="/nursing" element={<Nursing />} />

        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<AddPatient />} />

        <Route path="/patients/:id" element={<PatientLayout />}>
          <Route index element={<ViewPatient />} />
          <Route path="history" element={<History />} />
          <Route path="encounter" element={<Encounter />} />
          <Route path="encounters" element={<EncounterHistory />} />
          <Route path="encounter/:encounterId/view"
            element={<ViewEncounter />}
          />
          <Route path="encounter/:encounterId/edit" element={<EditEncounter />} />
          <Route path="encounter/:encounterId" element={<Encounter />} />
        </Route>

        <Route path="/patients/edit/:id" element={<EditPatient />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
