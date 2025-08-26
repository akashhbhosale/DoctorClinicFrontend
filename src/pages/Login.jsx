import { useState } from "react";
import http from "../api/http";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await http.post("/api/auth/login", { username, password });
      const { token, message } = res.data || {};

      if (token) {
        localStorage.setItem("token", token);
        setMessage(message || "Login successful");
        navigate("/dashboard");
      } else {
        setMessage("Login failed: no token returned");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-login.jpg')" }} // 👈 background image
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-md w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Doctor Login
        </h2>

        {/* Username */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="username" className="font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="col-span-2 p-2 border rounded w-full"
            required
          />
        </div>

        {/* Password with toggle */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <div className="relative col-span-2">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        {/* Sign Up button */}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
