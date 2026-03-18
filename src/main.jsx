// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.jsx";
import { PatientProvider } from "./context/PatientContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <PatientProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </PatientProvider>
);