import { createContext, useContext, useState, useEffect } from "react";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {

  const [activePatient, setActivePatient] = useState(() => {
    const saved = sessionStorage.getItem("patient");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (activePatient) {
      sessionStorage.setItem("patient", JSON.stringify(activePatient));
    } else {
      sessionStorage.removeItem("patient");
    }
  }, [activePatient]);

  return (
    <PatientContext.Provider value={{ activePatient, setActivePatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext);