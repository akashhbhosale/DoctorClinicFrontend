import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";

export default function ViewPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [id]);

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

      if (!response.ok) {
        setPatient(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">
        Loading patient details...
      </div>
    );

  if (!patient)
    return (
      <div className="p-10 text-center text-red-600">
        Patient not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-slate-200">

        <SectionHeader title="Patient Details" />

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          <Detail label="Registration No" value={patient.registrationNo} />
          <Detail label="ABHA ID" value={patient.abhaId} />

          <Detail label="Full Name" value={patient.fullName} />
          <Detail label="Gender" value={patient.gender} />

          <Detail label="Date of Birth" value={patient.dateOfBirth} />
          <Detail label="Age" value={patient.age} />

          <Detail label="Blood Group" value={patient.bloodGroup} />
          <Detail label="Phone Number" value={patient.phoneNo} />

          <Detail label="Email" value={patient.email} />
          <Detail label="Occupation" value={patient.occupation} />

          <div className="md:col-span-2">
            <Detail label="Address" value={patient.address} />
          </div>

        </div>

        <div className="flex justify-end gap-4 px-8 pb-8">
          <button
            onClick={() => navigate("/patients")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            Back
          </button>

          <button
            onClick={() => navigate(`/patients/edit/${patient.id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
        </div>

      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800 mt-1">
        {value || "—"}
      </p>
    </div>
  );
}
