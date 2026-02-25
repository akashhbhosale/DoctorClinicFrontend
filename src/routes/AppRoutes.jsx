// src/routes/AppRoutes.jsx
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
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

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

        {/* 🔥 PATIENT ROUTES */}
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<AddPatient />} />
        <Route path="/patients/:id" element={<ViewPatient />} />
        <Route path="/patients/edit/:id" element={<EditPatient />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
