// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.jsx";
import { PatientProvider } from "./context/PatientContext";
import { DoctorProvider } from "./context/DoctorContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <DoctorProvider>
  <PatientProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </PatientProvider>
  </DoctorProvider>
);