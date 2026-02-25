import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";

export default function EditPatient() {
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

      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateOfBirth") {
      const dob = new Date(value);
      const today = new Date();

      if (dob > today) {
        alert("Date of Birth cannot be in future");
        return;
      }

      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      setPatient({
        ...patient,
        dateOfBirth: value,
        age,
      });
    } else {
      setPatient({ ...patient, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/patients/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            abhaId: patient.abhaId,
            fullName: patient.fullName,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth,
            email: patient.email,
            phoneNo: patient.phoneNo,
            bloodGroup: patient.bloodGroup,
            occupation: patient.occupation,
            address: patient.address,
          }),
        }
      );

      if (!response.ok) {
        alert("Update failed");
        return;
      }

      alert("Patient updated successfully ✅");
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">
        Loading patient data...
      </div>
    );

  if (!patient)
    return (
      <div className="p-10 text-center text-red-600">Patient not found.</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-slate-200">
        <SectionHeader title="Edit Patient" />

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ABHA ID"
              name="abhaId"
              value={patient.abhaId}
              onChange={handleChange}
            />

            <Input
              label="Full Name"
              name="fullName"
              value={patient.fullName}
              onChange={handleChange}
            />

            <Input
              label="Phone Number"
              name="phoneNo"
              value={patient.phoneNo}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              value={patient.email}
              onChange={handleChange}
            />

            <Input
              label="Occupation"
              name="occupation"
              value={patient.occupation}
              onChange={handleChange}
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={patient.dateOfBirth}
              onChange={handleChange}
            />

            <Input label="Age" name="age" value={patient.age} readOnly />

            <Select
              label="Gender"
              name="gender"
              value={patient.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>

            <Select
              label="Blood Group"
              name="bloodGroup"
              value={patient.bloodGroup}
              onChange={handleChange}
            >
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
            </Select>

            <div className="md:col-span-2">
              <Textarea
                label="Address"
                name="address"
                value={patient.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full rounded-lg border px-4 py-2 min-h-[90px] focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
}
