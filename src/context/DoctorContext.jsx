import { createContext, useContext, useEffect, useState } from "react";

const DoctorContext = createContext();

export function DoctorProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctor = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setDoctor(null);
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:8080/api/doctors/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch doctor");
      }

      const data = await res.json();
      setDoctor(data);
      setError(null);
    } catch (err) {
      console.error("Fetch doctor error:", err);
      setDoctor(null);
      setError(err.message || "Failed to fetch doctor");
    } finally {
      setLoading(false);
    }
  };

  const clearDoctor = () => {
    setDoctor(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        loading,
        error,
        fetchDoctor,
        clearDoctor,
        setDoctor,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  return useContext(DoctorContext);
}