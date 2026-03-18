console.log("🔥 PatientLayout Mounted");
import { Outlet, useParams } from "react-router-dom"; // ✅ IMPORTANT
import { useEffect } from "react";
import { usePatient } from "../context/PatientContext";

export default function PatientLayout() {
  const { id } = useParams(); // ✅ MUST be here
  const { setActivePatient } = usePatient();

  console.log("PatientLayout ID:", id); // 👈 DEBUG

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:8080/api/patients/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        console.log("Setting active patient:", data); // 👈 MUST SHOW

        setActivePatient(data);

      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  return <Outlet />;
}