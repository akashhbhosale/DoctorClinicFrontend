import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPatients, setShowPatients] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const patientsRef = useRef(null);
  const [globalSearch, setGlobalSearch] = useState("");

  /* ================= Logout ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsOpen(false);
    navigate("/login");
  };

  /* ================= Active Styles ================= */
  const navClass = ({ isActive }) =>
    isActive
      ? "bg-red-600 px-3 py-1.5 rounded-lg text-white"
      : "hover:text-gray-200";

  const isPatientsActive = location.pathname.startsWith("/patients");

  /* ================= Close Dropdown on Outside Click ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (patientsRef.current && !patientsRef.current.contains(event.target)) {
        setShowPatients(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= Global Search================= */
  const handleGlobalSearch = (e) => {
    e.preventDefault();

    const trimmed = globalSearch.trim();
    if (!trimmed) return;

    navigate(`/patients?search=${encodeURIComponent(trimmed)}`);

    setGlobalSearch(""); // optional clear input
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* ================= Logo ================= */}
          <NavLink to="/dashboard" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="DoctorClinic Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold">Sushodh Doctor Clinic</span>
          </NavLink>

          {/* ================= Desktop Menu ================= */}
          <div className="hidden md:flex items-center space-x-6 text-lg font-medium">
            {/* Patient Search */}
            <form onSubmit={handleGlobalSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search patient (Name / ABHA / Mobile)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="px-4 py-1.5 rounded-l-full text-black text-sm w-60
               focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="submit"
                className="bg-red-600 px-4 py-1.5 rounded-r-full hover:bg-red-700"
              >
                🔍
              </button>
            </form>

            {/* Patients Dropdown */}
            <div className="relative" ref={patientsRef}>
              <button
                onClick={() => setShowPatients((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg
                  ${
                    isPatientsActive
                      ? "bg-red-600 text-white"
                      : "hover:text-gray-200"
                  }`}
              >
                Patients <ChevronDown size={16} />
              </button>

              {showPatients && (
                <div
                  className="absolute top-10 left-0 bg-blue-900
                                border border-blue-700 rounded-lg
                                shadow-xl w-48 z-50 overflow-hidden"
                >
                  <NavLink
                    to="/patients"
                    className="block px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => setShowPatients(false)}
                  >
                    All Patients
                  </NavLink>
                  <NavLink
                    to="/patients/new"
                    className="block px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => setShowPatients(false)}
                  >
                    Add Patient
                  </NavLink>
                </div>
              )}
            </div>

            {/* Core Pages */}
            <NavLink to="/encounter" className={navClass}>
              Encounter
            </NavLink>
            <NavLink to="/history" className={navClass}>
              History
            </NavLink>
            <NavLink to="/assessment" className={navClass}>
              Assessment
            </NavLink>
            <NavLink to="/allergies" className={navClass}>
              Allergies
            </NavLink>
            <NavLink to="/medication" className={navClass}>
              Medication
            </NavLink>
            <NavLink to="/nursing" className={navClass}>
              Nursing
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600
                         px-4 py-1.5 rounded-lg hover:bg-red-700"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* ================= Mobile Menu Button ================= */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= Mobile Dropdown ================= */}
      {isOpen && (
        <div className="md:hidden bg-blue-500 px-4 pb-4 space-y-3 text-lg font-medium">
          <form onSubmit={handleGlobalSearch}>
            <input
              type="text"
              placeholder="Search by Name, ABHA ID or Mobile"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-black"
            />
          </form>

          <NavLink
            to="/patients"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Patients
          </NavLink>

          <NavLink
            to="/patients/new"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Add Patient
          </NavLink>

          <NavLink
            to="/encounter"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Encounter
          </NavLink>
          <NavLink
            to="/history"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            History
          </NavLink>
          <NavLink
            to="/assessment"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Assessment
          </NavLink>
          <NavLink
            to="/allergies"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Allergies
          </NavLink>
          <NavLink
            to="/medication"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Medication
          </NavLink>
          <NavLink
            to="/nursing"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            Nursing
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
                       bg-red-600 py-2 rounded-lg hover:bg-red-700 mt-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
