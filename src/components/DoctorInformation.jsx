import React from "react";

function DoctorInformation() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-3">Doctor Information</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Doctor Name</label>
          <input
            type="text"
            defaultValue="Dr. Suresh Sharma"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Registration number</label>
          <input
            type="text"
            defaultValue="XX403727"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Qualification</label>
          <input
            type="text"
            defaultValue="MS Orthopedics, MBBS"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Specialization</label>
          <input
            type="text"
            placeholder="Specialization"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default DoctorInformation;