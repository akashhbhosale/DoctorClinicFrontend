import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

const SPECIALITIES = [
  { value: "CARDIOLOGIST", label: "Cardiologist" },
  { value: "DERMATOLOGIST", label: "Dermatologist" },
  { value: "GENERAL_PHYSICIAN", label: "General Physician" },
  { value: "GYNECOLOGIST", label: "Gynecologist" },
  { value: "NEUROLOGIST", label: "Neurologist" },
  { value: "ONCOLOGIST", label: "Oncologist" },
  { value: "ORTHOPEDIC_SURGEON", label: "Orthopedic Surgeon" },
  { value: "PEDIATRICIAN", label: "Pediatrician" },
  { value: "PSYCHIATRIST", label: "Psychiatrist" },
  { value: "RADIOLOGIST", label: "Radiologist" },
];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    qualification: "",
    speciality: "",
    email: "",
    phoneNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!/^[0-9]{10,15}$/.test(form.phoneNo)) {
      setMsg({ type: "error", text: "Phone must be 10–15 digits." });
      return;
    }
    if (!form.speciality) {
      setMsg({ type: "error", text: "Please select a speciality." });
      return;
    }

    setLoading(true);
    try {
      await http.post("/api/auth/register", form);
      setMsg({ type: "success", text: "Registered successfully. Please log in." });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed. Try again.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-login.jpg')" }} // 👈 background image
    >
      <form
        onSubmit={onSubmit}
        className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-md w-full max-w-lg space-y-4"
      >
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Doctor Signup
        </h1>

        {msg.text && (
          <div
            className={`p-2 rounded text-sm ${
              msg.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Full Name */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="fullName" className="font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter full name"
            value={form.fullName}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
            maxLength={80}
          />
        </div>

        {/* Username */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="username" className="font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={form.username}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
            maxLength={50}
          />
        </div>

        {/* Password */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
          />
        </div>

        {/* Qualification */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="qualification" className="font-medium">
            Qualification
          </label>
          <input
            id="qualification"
            name="qualification"
            type="text"
            placeholder="e.g. MBBS, MD"
            value={form.qualification}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
            maxLength={50}
          />
        </div>

        {/* Speciality */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="speciality" className="font-medium">
            Speciality
          </label>
          <select
            id="speciality"
            name="speciality"
            value={form.speciality}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
          >
            <option value="">-- Select Speciality --</option>
            {SPECIALITIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
            maxLength={100}
          />
        </div>

        {/* Phone Number */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="phoneNo" className="font-medium">
            Phone No
          </label>
          <input
            id="phoneNo"
            name="phoneNo"
            type="tel"
            placeholder="10–15 digit phone no."
            value={form.phoneNo}
            onChange={onChange}
            className="col-span-2 p-2 border rounded w-full"
            required
            pattern="^[0-9]{10,15}$"
            title="Phone must be 10–15 digits"
          />
        </div>

        <p className="text-xs text-gray-500">
          * Registration No. is generated automatically on the server.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </p>
      </form>
    </div>
  );
}
