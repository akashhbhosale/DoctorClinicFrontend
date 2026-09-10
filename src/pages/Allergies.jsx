import { useState, useEffect } from "react";
import Select from "react-select";
import { usePatient } from "../context/PatientContext";
import { useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const toLabel = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function Allergies() {
  const { id } = useParams();
  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  // Same auth pattern as History.jsx — backend requires a valid JWT on
  // every endpoint except /api/auth/**.
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [substanceMaster, setSubstanceMaster] = useState([]);
  const [manifestationMaster, setManifestationMaster] = useState([]);
  const [criticalityOptions, setCriticalityOptions] = useState([]);
  const [verificationStatusOptions, setVerificationStatusOptions] = useState([]);

  const [allergyList, setAllergyList] = useState([]);

  const [substance, setSubstance] = useState(null);
  const [criticality, setCriticality] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [manifestations, setManifestations] = useState([]);
  const [comment, setComment] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    fetch("http://localhost:8080/api/allergies/master-data", {
      headers: { ...authHeaders() },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubstanceMaster(data.substances || []);
        setManifestationMaster(data.manifestations || []);
        setCriticalityOptions(data.criticalityOptions || []);
        setVerificationStatusOptions(data.verificationStatusOptions || []);
      })
      .catch((err) => console.error("Error loading allergy master data:", err));
  }, []);

  useEffect(() => {
    if (!patientId) return;

    fetch(`http://localhost:8080/api/allergies/patient/${patientId}`, {
      headers: { ...authHeaders() },
    })
      .then((res) => res.json())
      .then((data) => setAllergyList(data || []))
      .catch((err) => console.error("Error loading patient allergies:", err));
  }, [patientId]);

  const substanceOptions = substanceMaster.map((item) => ({
    value: item.id,
    label: item.substanceName,
  }));

  const manifestationOptions = manifestationMaster.map((item) => ({
    value: item.id,
    label: item.manifestationName,
  }));

  const criticalityDropdownOptions = criticalityOptions.map((value) => ({
    value,
    label: toLabel(value),
  }));

  const verificationStatusDropdownOptions = verificationStatusOptions.map((value) => ({
    value,
    label: toLabel(value),
  }));

  const resetForm = () => {
    setSubstance(null);
    setCriticality(null);
    setVerificationStatus(null);
    setManifestations([]);
    setComment("");
  };

  const addAllergy = async () => {
    if (!substance) {
      setErrorMessage("Please select a substance.");
      return;
    }
    if (!criticality) {
      setErrorMessage("Please select criticality.");
      return;
    }
    if (!verificationStatus) {
      setErrorMessage("Please select verification status.");
      return;
    }
    if (!manifestations || manifestations.length === 0) {
      setErrorMessage("Please select at least one manifestation.");
      return;
    }

    const alreadyExists = allergyList.some(
      (item) => item.substanceId === substance.value
    );

    if (alreadyExists) {
      setErrorMessage("This substance is already recorded as an allergy for this patient.");
      resetForm();
      return;
    }

    const body = {
      patientId,
      substanceId: substance.value,
      criticality: criticality.value,
      verificationStatus: verificationStatus.value,
      comment: comment.trim() || null,
      manifestationIds: manifestations.map((m) => m.value),
    };

    try {
      const res = await fetch("http://localhost:8080/api/allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to add allergy.");
        return;
      }

      setAllergyList([...allergyList, data]);
      resetForm();
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error while adding allergy.");
    }
  };

  const removeAllergy = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/allergies/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      setAllergyList(allergyList.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete allergy.");
    }
  };

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <PatientSelectionRequired
            title="Please select a patient"
            message="A patient must be selected before viewing or updating allergies. You can open the patient list or add a new patient."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Allergies" />

        <div className="px-8 py-8 space-y-10">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Allergies Information
              </h2>
              <p className="text-sm text-slate-500">
                Allergies are usually lifelong — add substance, criticality,
                manifestations, and verification status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Substance <span className="text-red-500">*</span>
                </label>
                <Select
                  options={substanceOptions}
                  value={substance}
                  onChange={setSubstance}
                  placeholder="Substance"
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Criticality <span className="text-red-500">*</span>
                </label>
                <Select
                  options={criticalityDropdownOptions}
                  value={criticality}
                  onChange={setCriticality}
                  placeholder="Criticality"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Verification Status <span className="text-red-500">*</span>
                </label>
                <Select
                  options={verificationStatusDropdownOptions}
                  value={verificationStatus}
                  onChange={setVerificationStatus}
                  placeholder="Verification"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Manifestations <span className="text-red-500">*</span>
                </label>
                <Select
                  options={manifestationOptions}
                  value={manifestations}
                  onChange={setManifestations}
                  placeholder="Manifestation"
                  isMulti
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Comment
                </label>
                <input
                  type="text"
                  placeholder="Comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              onClick={addAllergy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-800 text-white px-5 py-2.5 font-medium hover:bg-blue-600 shadow transition"
            >
              <span className="text-lg leading-none">+</span> Add
            </button>

            {allergyList.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Substance</th>
                      <th className="px-4 py-3 text-left">Criticality</th>
                      <th className="px-4 py-3 text-left">Manifestation</th>
                      <th className="px-4 py-3 text-left">Verification Status</th>
                      <th className="px-4 py-3 text-left">Comment</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {allergyList.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.substanceName}</td>
                        <td className="px-4 py-3">{toLabel(item.criticality)}</td>
                        <td className="px-4 py-3">
                          {(item.manifestationNames || []).join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          {toLabel(item.verificationStatus)}
                        </td>
                        <td className="px-4 py-3">{item.comment || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeAllergy(item.id)}
                            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
