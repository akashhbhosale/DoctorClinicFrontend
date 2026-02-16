import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";

export default function AddPatient() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState({
    abhaId: "",
    fullName: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    phoneNo: "",
    email: "",
    bloodGroup: "",
    occupation: "",
    address: "",
  });

  /* -------- Handle Change -------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateOfBirth") {
      if (!value) {
        setPatient((prev) => ({
          ...prev,
          dateOfBirth: "",
          age: "",
        }));
        return;
      }

      const dob = new Date(value);
      const today = new Date();

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();

      if (today.getDate() < dob.getDate()) {
        months--;
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      let formattedAge = "";

      if (years <= 0) {
        formattedAge = `${months} Month${months !== 1 ? "s" : ""}`;
      } else if (months === 0) {
        formattedAge = `${years} Year${years !== 1 ? "s" : ""}`;
      } else {
        formattedAge = `${years} Year${years !== 1 ? "s" : ""} ${months} Month${
          months !== 1 ? "s" : ""
        }`;
      }

      setPatient((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: formattedAge,
      }));
    } else {
      setPatient((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* -------- Submit -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login expired. Please login again.");
      navigate("/login");
      return;
    }

    // ✅ Payload strictly matching backend DTO
    const payload = {
      abhaId: patient.abhaId.trim(),
      fullName: patient.fullName.trim(),
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      phoneNo: patient.phoneNo,
      email: patient.email.trim(),
      bloodGroup: patient.bloodGroup,
      occupation: patient.occupation.trim(),
      address: patient.address.trim(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/patients/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (400)
        if (typeof data === "object") {
          const firstError = Object.values(data)[0];
          alert(firstError);
        } else {
          alert(data.message || "Failed to save patient");
        }
        return;
      }

      alert("Patient saved successfully ✅");
      navigate("/patients");
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-5 px-4">
      <div className="max-w-5xl mx-autobg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200">
        {/* Header */}
        <SectionHeader title="Add New Patient's Information" />

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">
          {/* -------- BASIC INFO -------- */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Basic Information
            </h2>

            <p className="text-sm text-slate-500 max-w-xl mb-2">
              Enter patient details carefully. Fields marked
              <span className="text-red-500 font-medium"> *</span>
              &nbsp;are mandatory.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ABHA ID *
                </label>
                <input
                  type="text"
                  name="abhaId"
                  value={patient.abhaId}
                  onChange={handleChange}
                  placeholder="ABHA-XXXXXXXX"
                  className="w-full rounded-lg border px-4 py-2 focus:ring-1"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Minimum 10 characters, alphanumeric
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter Full Name"
                  value={patient.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2 focus:ring-1 "
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1 - Column 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={patient.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500/40
                   focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Row 1 - Column 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={patient.bloodGroup}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500/40
                   focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                </select>
              </div>

              {/* Row 2 - Column 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={patient.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500/40
                   focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Row 2 - Column 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  value={patient.age || ""}
                  readOnly
                  className="w-full rounded-lg border border-slate-200
             bg-slate-100 text-slate-600
             px-4 py-2.5 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* -------- CONTACT INFO -------- */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="phoneNo"
                placeholder="Mobile Number *"
                value={patient.phoneNo}
                onChange={handleChange}
                className="rounded-lg border px-4 py-2"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={patient.email}
                onChange={handleChange}
                className="rounded-lg border px-4 py-2"
                required
              />
            </div>
          </section>

          {/* -------- OTHER -------- */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Details
            </h2>

            <input
              type="text"
              name="occupation"
              placeholder="Occupation"
              value={patient.occupation}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 mb-4"
            />

            <textarea
              name="address"
              placeholder="Address"
              value={patient.address}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 min-h-[90px]"
            />
          </section>

          {/* -------- ACTIONS -------- */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
