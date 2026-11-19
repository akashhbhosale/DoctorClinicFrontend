import { useState, useEffect } from "react";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";

import SectionHeader from "../components/SectionHeader";
import PatientSelectionRequired from "../components/PatientSelectionRequired";
import { usePatient } from "../context/PatientContext";
import { useDoctor } from "../context/DoctorContext";
import { createEncounter } from "../services/encounterApi";
import {
  getMedicineMaster,
  getDoseFormMaster,
  getRouteOfAdministrationMaster,
  getDirectionOfUseMaster,
  getSurgeryMaster,
  addEncounterMedication,
  getEncounterMedication,
  deleteEncounterMedication,
  addEncounterSurgicalTreatment,
  getEncounterSurgicalTreatment,
  deleteEncounterSurgicalTreatment,
  saveEncounterFollowUp,
  getEncounterFollowUp,
} from "../services/medicationApi";

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.15)" : "none",
  }),
};

const lateralityOptions = [
  { value: "LEFT", label: "Left" },
  { value: "RIGHT", label: "Right" },
  { value: "BILATERAL", label: "Bilateral" },
];

export default function Medication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctor } = useDoctor();

  const patientContext = usePatient();
  const activePatient = patientContext?.activePatient;
  const patientId = activePatient?.id || id;

  const [loading, setLoading] = useState(false);
  const [encounterId, setEncounterId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  /* ============ MEDICATION FORM ============ */
  const [medicationType, setMedicationType] = useState("GENERIC");
  const [medicine, setMedicine] = useState(null);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [doseForm, setDoseForm] = useState(null);
  const [doseFormOptions, setDoseFormOptions] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [direction, setDirection] = useState(null);
  const [directionOptions, setDirectionOptions] = useState([]);
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [medComment, setMedComment] = useState("");
  const [medications, setMedications] = useState([]);
  const [medLoading, setMedLoading] = useState(false);

  /* ============ SURGICAL TREATMENT FORM ============ */
  const [surgery, setSurgery] = useState(null);
  const [surgeryOptions, setSurgeryOptions] = useState([]);
  const [laterality, setLaterality] = useState(null);
  const [site, setSite] = useState("");
  const [method, setMethod] = useState("");
  const [device, setDevice] = useState("");
  const [surgicalTreatments, setSurgicalTreatments] = useState([]);
  const [surgeryLoading, setSurgeryLoading] = useState(false);

  /* ============ FOLLOW UP FORM ============ */
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpSaved, setFollowUpSaved] = useState(false);

  const getEncounterStorageKey = () => `currentEncounter_${patientId}`;

  const ensureEncounterExists = async () => {
    if (encounterId) return encounterId;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (savedEncounterId) {
      const parsedId = Number(savedEncounterId);
      if (!Number.isNaN(parsedId)) {
        setEncounterId(parsedId);
        return parsedId;
      }
    }

    if (!doctor?.id) {
      throw new Error("Doctor information not loaded");
    }

    const res = await createEncounter({
      patientId: Number(patientId),
      doctorId: doctor.id,
    });
    const newEncounterId = res.data.id;

    setEncounterId(newEncounterId);
    sessionStorage.setItem(getEncounterStorageKey(), String(newEncounterId));

    return newEncounterId;
  };

  /* ---------------- Load master dropdowns ---------------- */
  const loadMedicineOptions = async (search = "") => {
    try {
      const res = await getMedicineMaster(medicationType, search, 0, 20);
      setMedicineOptions(
        res.data.content.map((m) => ({ value: m.id, label: m.medicineName }))
      );
    } catch (error) {
      console.error("Load medicine master error:", error?.response?.data || error);
    }
  };

  const loadDoseFormOptions = async (search = "") => {
    try {
      const res = await getDoseFormMaster(search, 0, 20);
      setDoseFormOptions(
        res.data.content.map((m) => ({ value: m.id, label: m.doseFormName }))
      );
    } catch (error) {
      console.error("Load dose form error:", error?.response?.data || error);
    }
  };

  const loadRouteOptions = async (search = "") => {
    try {
      const res = await getRouteOfAdministrationMaster(search, 0, 20);
      setRouteOptions(
        res.data.content.map((m) => ({ value: m.id, label: m.routeName }))
      );
    } catch (error) {
      console.error("Load route error:", error?.response?.data || error);
    }
  };

  const loadDirectionOptions = async (search = "") => {
    try {
      const res = await getDirectionOfUseMaster(search, 0, 20);
      setDirectionOptions(
        res.data.content.map((m) => ({ value: m.id, label: m.directionName }))
      );
    } catch (error) {
      console.error("Load direction error:", error?.response?.data || error);
    }
  };

  const loadSurgeryOptions = async (search = "") => {
    try {
      const res = await getSurgeryMaster(search, 0, 20);
      setSurgeryOptions(
        res.data.content.map((m) => ({ value: m.id, label: m.surgeryName }))
      );
    } catch (error) {
      console.error("Load surgery error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    loadDoseFormOptions();
    loadRouteOptions();
    loadDirectionOptions();
    loadSurgeryOptions();
  }, []);

  // Medicine dropdown reloads whenever the Generics/Brand toggle changes,
  // and the currently-selected medicine is cleared since it belonged to
  // the other type.
  useEffect(() => {
    setMedicine(null);
    loadMedicineOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicationType]);

  /* ---------------- Load existing records ---------------- */
  const loadMedications = async (currentEncounterId) => {
    if (!currentEncounterId) return;
    try {
      const res = await getEncounterMedication(currentEncounterId);
      setMedications(res.data || []);
    } catch (error) {
      console.error("Load medications error:", error?.response?.data || error);
    }
  };

  const loadSurgicalTreatments = async (currentEncounterId) => {
    if (!currentEncounterId) return;
    try {
      const res = await getEncounterSurgicalTreatment(currentEncounterId);
      setSurgicalTreatments(res.data || []);
    } catch (error) {
      console.error("Load surgical treatments error:", error?.response?.data || error);
    }
  };

  const loadFollowUp = async (currentEncounterId) => {
    if (!currentEncounterId) return;
    try {
      const res = await getEncounterFollowUp(currentEncounterId);
      if (res.status === 200 && res.data) {
        setFollowUpDate(res.data.followUpDate || "");
        setFollowUpInstructions(res.data.followUpInstructions || "");
      }
    } catch (error) {
      console.error("Load follow-up error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const savedEncounterId = sessionStorage.getItem(getEncounterStorageKey());
    if (!savedEncounterId) return;

    const parsedId = Number(savedEncounterId);
    if (Number.isNaN(parsedId)) return;

    setEncounterId(parsedId);
    loadMedications(parsedId);
    loadSurgicalTreatments(parsedId);
    loadFollowUp(parsedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  /* ---------------- Medication add/remove ---------------- */
  const addMedicationRecord = async () => {
    if (!medicine || !direction || !dosage.trim() || !duration) {
      alert("Please fill Medicine Name, Direction of Use, Dosage, and Duration");
      return;
    }

    try {
      setMedLoading(true);
      const currentEncounterId = await ensureEncounterExists();

      await addEncounterMedication({
        encounterId: currentEncounterId,
        medicineMasterId: medicine.value,
        doseFormId: doseForm ? doseForm.value : null,
        routeOfAdministrationId: route ? route.value : null,
        directionOfUseId: direction.value,
        dosage: dosage.trim(),
        durationDays: Number(duration),
        comment: medComment.trim() || null,
      });

      setMedicine(null);
      setDoseForm(null);
      setRoute(null);
      setDirection(null);
      setDosage("");
      setDuration("");
      setMedComment("");

      await loadMedications(currentEncounterId);
    } catch (error) {
      console.error("Add medication error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to add medication");
    } finally {
      setMedLoading(false);
    }
  };

  const removeMedication = async (medId) => {
    try {
      setMedLoading(true);
      await deleteEncounterMedication(medId);
      await loadMedications(encounterId);
    } catch (error) {
      console.error("Delete medication error:", error?.response?.data || error);
    } finally {
      setMedLoading(false);
    }
  };

  /* ---------------- Surgical treatment add/remove ---------------- */
  const addSurgicalTreatmentRecord = async () => {
    if (!surgery) {
      alert("Please select a surgery");
      return;
    }

    try {
      setSurgeryLoading(true);
      const currentEncounterId = await ensureEncounterExists();

      await addEncounterSurgicalTreatment({
        encounterId: currentEncounterId,
        surgeryMasterId: surgery.value,
        laterality: laterality ? laterality.value : null,
        site: site.trim() || null,
        method: method.trim() || null,
        device: device.trim() || null,
      });

      setSurgery(null);
      setLaterality(null);
      setSite("");
      setMethod("");
      setDevice("");

      await loadSurgicalTreatments(currentEncounterId);
    } catch (error) {
      console.error("Add surgical treatment error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to add surgical treatment");
    } finally {
      setSurgeryLoading(false);
    }
  };

  const removeSurgicalTreatment = async (surgId) => {
    try {
      setSurgeryLoading(true);
      await deleteEncounterSurgicalTreatment(surgId);
      await loadSurgicalTreatments(encounterId);
    } catch (error) {
      console.error("Delete surgical treatment error:", error?.response?.data || error);
    } finally {
      setSurgeryLoading(false);
    }
  };

  /* ---------------- Follow up save ---------------- */
  const saveFollowUp = async () => {
    try {
      setFollowUpLoading(true);
      const currentEncounterId = await ensureEncounterExists();

      await saveEncounterFollowUp(currentEncounterId, {
        followUpDate: followUpDate || null,
        followUpInstructions: followUpInstructions.trim() || null,
      });

      setFollowUpSaved(true);
      setTimeout(() => setFollowUpSaved(false), 3000);
    } catch (error) {
      console.error("Save follow-up error:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to save follow-up");
    } finally {
      setFollowUpLoading(false);
    }
  };

  /* ================= RENDER ================= */
  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
        <PatientSelectionRequired
          title="Please select a patient"
          message="A patient must be selected before prescribing medication."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6">
      <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <SectionHeader title="Medication" />

        <div className="p-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Prescribe medication, record surgical treatment, and set a
                  follow-up for this encounter.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Encounter ID: {encounterId || "Not created yet"}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!patientId) return;
                  navigate(`/patients/${patientId}/medication-history`);
                }}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 shadow-sm transition font-medium"
              >
                Medication History
              </button>
            </div>
          </div>

          {/* ================= MEDICATION ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Medication</h2>
              <p className="text-sm text-slate-500">
                Prescribe a medicine with dose form, route, direction, dosage,
                and duration.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-slate-700">
                Medication Type
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={medicationType === "GENERIC"}
                  onChange={() => setMedicationType("GENERIC")}
                />
                Generics
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={medicationType === "BRAND"}
                  onChange={() => setMedicationType("BRAND")}
                />
                Brand
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <Select
                  options={medicineOptions}
                  value={medicine}
                  onChange={setMedicine}
                  placeholder="Medicine Name"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadMedicineOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dose Form
                </label>
                <Select
                  options={doseFormOptions}
                  value={doseForm}
                  onChange={setDoseForm}
                  placeholder="Dose Form"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadDoseFormOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Route Of Administration
                </label>
                <Select
                  options={routeOptions}
                  value={route}
                  onChange={setRoute}
                  placeholder="Route Of Administration"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadRouteOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Direction Of Use <span className="text-red-500">*</span>
                </label>
                <Select
                  options={directionOptions}
                  value={direction}
                  onChange={setDirection}
                  placeholder="Direction Of Use"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadDirectionOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duration (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Comment
                </label>
                <input
                  value={medComment}
                  onChange={(e) => setMedComment(e.target.value)}
                  placeholder="Comment"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={addMedicationRecord}
              disabled={medLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 text-white px-5 py-2.5 font-medium hover:bg-blue-800 shadow transition disabled:opacity-50"
            >
              <span className="text-lg leading-none">+</span>{" "}
              {medLoading ? "Saving..." : "Add"}
            </button>

            {medications.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Medicine Name</th>
                      <th className="px-4 py-3 text-left">Dose Form</th>
                      <th className="px-4 py-3 text-left">Route Of Admin</th>
                      <th className="px-4 py-3 text-left">Direction Of Use</th>
                      <th className="px-4 py-3 text-left">Dosage</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Comment</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {medications.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.medicineName}</td>
                        <td className="px-4 py-3">{item.doseForm || "-"}</td>
                        <td className="px-4 py-3">
                          {item.routeOfAdministration || "-"}
                        </td>
                        <td className="px-4 py-3">{item.directionOfUse}</td>
                        <td className="px-4 py-3">{item.dosage}</td>
                        <td className="px-4 py-3">{item.durationDays} Days</td>
                        <td className="px-4 py-3">{item.comment || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeMedication(item.id)}
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

          {/* ================= SURGICAL TREATMENT ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Surgical Treatment
              </h2>
              <p className="text-sm text-slate-500">
                Record any surgical procedure planned or performed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Surgery Name <span className="text-red-500">*</span>
                </label>
                <Select
                  options={surgeryOptions}
                  value={surgery}
                  onChange={setSurgery}
                  placeholder="Surgery Name"
                  onInputChange={(v, meta) => {
                    if (meta.action === "input-change") loadSurgeryOptions(v);
                  }}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Laterality
                </label>
                <Select
                  options={lateralityOptions}
                  value={laterality}
                  onChange={setLaterality}
                  placeholder="Laterality"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Site
                </label>
                <input
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="Surgery Site"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Method
                </label>
                <input
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Surgery Method"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Device
                </label>
                <input
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="Surgery Device"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={addSurgicalTreatmentRecord}
              disabled={surgeryLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 text-white px-5 py-2.5 font-medium hover:bg-blue-800 shadow transition disabled:opacity-50"
            >
              <span className="text-lg leading-none">+</span>{" "}
              {surgeryLoading ? "Saving..." : "Add"}
            </button>

            {surgicalTreatments.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Surgery Name</th>
                      <th className="px-4 py-3 text-left">Laterality</th>
                      <th className="px-4 py-3 text-left">Site</th>
                      <th className="px-4 py-3 text-left">Method</th>
                      <th className="px-4 py-3 text-left">Device</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {surgicalTreatments.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.surgeryName}</td>
                        <td className="px-4 py-3">
                          {item.laterality
                            ? item.laterality.charAt(0) +
                              item.laterality.slice(1).toLowerCase()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">{item.site || "-"}</td>
                        <td className="px-4 py-3">{item.method || "-"}</td>
                        <td className="px-4 py-3">{item.device || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeSurgicalTreatment(item.id)}
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

          {/* ================= FOLLOW UP ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Follow Up
                </h2>
                <p className="text-sm text-slate-500">
                  One follow-up plan per encounter.
                </p>
              </div>
              {followUpSaved && (
                <span className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Follow Up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Follow Up Instructions
                </label>
                <input
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  placeholder="Follow Up Instructions"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={saveFollowUp}
                  disabled={followUpLoading}
                  className="w-full rounded-xl bg-blue-900 text-white px-4 py-2.5 hover:bg-blue-800 shadow disabled:opacity-50"
                >
                  {followUpLoading ? "Saving..." : "Save Follow Up"}
                </button>
              </div>
            </div>
          </section>

          {/* ================= PRESCRIPTION PREVIEW ================= */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 shadow-sm transition font-medium"
            >
              Prescription Preview
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Prescription Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <p className="text-slate-500">
                  Doctor: <span className="text-slate-800">{doctor?.fullName}</span>
                </p>
                <p className="text-slate-500">
                  Patient:{" "}
                  <span className="text-slate-800">
                    {activePatient?.fullName}
                  </span>
                </p>
                <p className="text-slate-500">
                  Encounter ID:{" "}
                  <span className="text-slate-800">{encounterId || "-"}</span>
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Medications
                </h3>
                {medications.length === 0 ? (
                  <p className="text-slate-400">No medications prescribed.</p>
                ) : (
                  <ol className="list-decimal list-inside space-y-1">
                    {medications.map((m) => (
                      <li key={m.id}>
                        {m.medicineName} — {m.dosage}, {m.directionOfUse},{" "}
                        {m.durationDays} days
                        {m.doseForm ? ` (${m.doseForm})` : ""}
                        {m.comment ? ` — ${m.comment}` : ""}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Surgical Treatment
                </h3>
                {surgicalTreatments.length === 0 ? (
                  <p className="text-slate-400">No surgical treatment recorded.</p>
                ) : (
                  <ol className="list-decimal list-inside space-y-1">
                    {surgicalTreatments.map((s) => (
                      <li key={s.id}>
                        {s.surgeryName}
                        {s.laterality ? ` (${s.laterality})` : ""}
                        {s.site ? ` — Site: ${s.site}` : ""}
                        {s.method ? `, Method: ${s.method}` : ""}
                        {s.device ? `, Device: ${s.device}` : ""}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Follow Up</h3>
                {!followUpDate && !followUpInstructions ? (
                  <p className="text-slate-400">No follow-up set.</p>
                ) : (
                  <p>
                    {followUpDate ? `Date: ${followUpDate}` : ""}
                    {followUpDate && followUpInstructions ? " — " : ""}
                    {followUpInstructions}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-50"
              >
                Print
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg bg-blue-900 text-white px-5 py-2 hover:bg-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
