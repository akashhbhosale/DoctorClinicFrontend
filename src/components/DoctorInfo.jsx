import { useEffect, useState } from "react";

export default function DoctorInfo() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/doctors/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch doctor");
        }
        return res.json();
      })
      .then((data) => {
        setDoctor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        Loading doctor info...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4 bg-white text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
      <h2 className="text-lg font-semibold text-gray-700">
        Doctor Information
      </h2>

      <p>
        <span className="font-medium">Name:</span>{" "}
        {doctor.username}
      </p>

      <p>
        <span className="font-medium">Registration No:</span>{" "}
        {doctor.registrationNo}
      </p>

      <p>
        <span className="font-medium">Qualification:</span>{" "}
        {doctor.qualification}
      </p>

      <p>
        <span className="font-medium">Speciality:</span>{" "}
        {doctor.speciality}
      </p>
    </div>
  );
}
