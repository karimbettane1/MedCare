import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../Styles/AppointmentForm.css";
import { api } from "../api";
import { appAlert } from "../Scripts/appAlert";

const SLOT_DURATION = 30;

function slotEndTime(slot) {
  const [h, m] = slot.split(":").map(Number);
  const end = h * 60 + m + SLOT_DURATION;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function AppointmentForm() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectedDoctorRaw = sessionStorage.getItem("selectedDoctor");
  const selectedDoctor = selectedDoctorRaw ? JSON.parse(selectedDoctorRaw) : null;
  const doctorName = selectedDoctor?.name || "Médecin sélectionné";
  const doctorSpecialtyLabel = selectedDoctor?.specialty || "Spécialité non précisée";
  const doctorCityLabel = selectedDoctor?.city || "Ville non précisée";

  const [patientName, setPatientName] = useState("");
  const [patientNumber, setPatientNumber] = useState("");
  const [patientGender, setPatientGender] = useState("default");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [preferredMode, setPreferredMode] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const todayString = toLocalDateString(new Date());

  const loadAvailability = useCallback(async () => {
    if (!appointmentDate || !selectedDoctor?.id) {
      setAvailableSlots([]);
      setSlotsError("");
      return;
    }

    setSlotsLoading(true);
    setSlotsError("");
    try {
      const response = await api.getAvailability(selectedDoctor.id, appointmentDate);
      setAvailableSlots(response?.data?.slots || []);
    } catch (error) {
      setAvailableSlots([]);
      setSlotsError(error.message || "Impossible de charger les disponibilités.");
    } finally {
      setSlotsLoading(false);
    }
  }, [appointmentDate, selectedDoctor?.id]);

  useEffect(() => {
    setSelectedSlot("");
    loadAvailability();
  }, [loadAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!patientName.trim()) {
      errors.patientName = "Le nom du patient est requis";
    } else if (patientName.trim().length < 3) {
      errors.patientName = "Le nom doit contenir au moins 3 caractères";
    }

    if (!patientNumber.trim()) {
      errors.patientNumber = "Le numéro de téléphone est requis";
    } else {
      const phoneRegex = /^(?:\+?\d{1,3})?[0-9\s-()]{8,15}$/;
      if (!phoneRegex.test(patientNumber.trim())) {
        errors.patientNumber = "Veuillez saisir un numéro de téléphone valide";
      }
    }

    if (patientGender === "default") {
      errors.patientGender = "Veuillez sélectionner le genre du patient";
    }

    if (!appointmentDate) {
      errors.appointmentDate = "Veuillez sélectionner une date";
    }

    if (!selectedSlot) {
      errors.selectedSlot = "Veuillez sélectionner un créneau horaire";
    }

    if (preferredMode === "default") {
      errors.preferredMode = "Veuillez sélectionner le mode de consultation";
    }

    if (!selectedDoctor?.id) {
      errors.doctor = "Veuillez d'abord sélectionner un médecin";
    }

    const patientId = Number(localStorage.getItem("userId"));
    if (!patientId) {
      errors.user = "Utilisateur non connecté";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      await api.createAppointment({
        patient_id: patientId,
        doctor_id: selectedDoctor.id,
        appointment_datetime: `${appointmentDate} ${selectedSlot}:00`,
        reason: selectedDoctor?.specialty ? `Consultation ${selectedDoctor.specialty}` : "Consultation générale",
        preferred_mode: preferredMode,
      });

      setPatientName("");
      setPatientNumber("");
      setPatientGender("default");
      setPreferredMode("default");
      setFormErrors({});
      setIsSubmitted(true);

      await appAlert.fire({
        icon: "success",
        title: "Rendez-vous enregistré",
        text: "Votre rendez-vous a été enregistré avec succès.",
        confirmButtonText: "Parfait",
      });

      setSelectedSlot("");
      loadAvailability();
    } catch (error) {
      const message = error.message || "Une erreur est survenue. Veuillez réessayer.";
      await appAlert.fire({
        icon: "error",
        title: "Inscription impossible",
        text: message,
        confirmButtonText: "Réessayer",
      });

      if (message.includes("réservée")) {
        loadAvailability();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="appointment-form-section">
      <h1 className="legal-siteTitle">
        <Link to="/">MedCare</Link>
      </h1>

      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">
            <span>Réserver un rendez-vous</span>
          </h2>
          <p className="form-subtitle">
            Renseignez vos informations pour confirmer votre consultation.
          </p>
        </div>

        <div className="doctor-summary">
          <div className="doctor-summary-item">
            <span className="summary-label">Médecin</span>
            <strong>{doctorName}</strong>
          </div>
          <div className="doctor-summary-item">
            <span className="summary-label">Spécialité</span>
            <strong>{doctorSpecialtyLabel}</strong>
          </div>
          <div className="doctor-summary-item">
            <span className="summary-label">Ville</span>
            <strong>{doctorCityLabel}</strong>
          </div>
        </div>

        <div className="appointment-info-note">
          <h3>Informations avant confirmation</h3>
          <ul>
            <li>Vérifiez vos coordonnées pour recevoir les informations du rendez-vous.</li>
            <li>Le mode choisi (vocal/vidéo) sera transmis au médecin.</li>
            <li>Les consultations ont lieu entre 08:30 et 16:00 par créneaux de 30 minutes.</li>
          </ul>
        </div>

        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Nom complet du patient
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ex: Sara El Idrissi"
                required
              />
              {formErrors.patientName && <p className="error-message">{formErrors.patientName}</p>}
            </label>

            <label>
              Numéro de téléphone
              <input
                type="text"
                value={patientNumber}
                onChange={(e) => setPatientNumber(e.target.value)}
                placeholder="Ex: 0612345678"
                required
              />
              {formErrors.patientNumber && <p className="error-message">{formErrors.patientNumber}</p>}
            </label>

            <label>
              Genre
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                required
              >
                <option value="default">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="private">Je préfère ne pas préciser</option>
              </select>
              {formErrors.patientGender && <p className="error-message">{formErrors.patientGender}</p>}
            </label>

            <label>
              Date du rendez-vous
              <input
                type="date"
                value={appointmentDate}
                min={todayString}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
              {formErrors.appointmentDate && <p className="error-message">{formErrors.appointmentDate}</p>}
            </label>
          </div>

          <div className="slot-picker">
            <span className="slot-picker-label">
              Heure du rendez-vous
              <span className="slot-required">*</span>
            </span>

            {!appointmentDate && (
              <p className="slot-hint">
                Sélectionnez d'abord une date pour afficher les créneaux disponibles (08:30 → 16:00, toutes les 30 minutes).
              </p>
            )}

            {appointmentDate && slotsLoading && (
              <div className="slots-loading" role="status" aria-live="polite">
                <span className="slots-spinner" aria-hidden="true" />
                Chargement des disponibilités...
              </div>
            )}

            {appointmentDate && !slotsLoading && slotsError && (
              <p className="error-message">{slotsError}</p>
            )}

            {appointmentDate && !slotsLoading && !slotsError && availableSlots.length === 0 && (
              <p className="slots-empty">
                Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
              </p>
            )}

            {appointmentDate && !slotsLoading && !slotsError && availableSlots.length > 0 && (
              <>
                <div className="slot-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn${selectedSlot === slot ? " slot-btn--selected" : ""}`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setFormErrors((prev) => ({ ...prev, selectedSlot: undefined }));
                      }}
                      aria-pressed={selectedSlot === slot}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="slot-hint">
                  {selectedSlot
                    ? `Créneau sélectionné : ${selectedSlot} → ${slotEndTime(selectedSlot)} (durée ${SLOT_DURATION} min)`
                    : "Choisissez une heure dans la liste."}
                </p>
              </>
            )}

            {formErrors.selectedSlot && <p className="error-message">{formErrors.selectedSlot}</p>}
          </div>

          <label className="form-mode-label">
            Mode de consultation
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value)}
              required
            >
              <option value="default">Sélectionner</option>
              <option value="voice">Appel vocal</option>
              <option value="video">Appel vidéo</option>
            </select>
            {formErrors.preferredMode && <p className="error-message">{formErrors.preferredMode}</p>}
          </label>

          {(formErrors.doctor || formErrors.user) && (
            <div className="form-global-errors">
              {formErrors.doctor && <p className="error-message">{formErrors.doctor}</p>}
              {formErrors.user && <p className="error-message">{formErrors.user}</p>}
            </div>
          )}

          <button type="submit" className="text-appointment-btn" disabled={isSubmitting || slotsLoading}>
            {isSubmitting ? "Envoi en cours..." : "Confirmer le rendez-vous"}
          </button>

          <p className="success-message" style={{ display: isSubmitted ? "block" : "none" }}>
            Les détails du rendez-vous ont été envoyés au numéro du patient.
          </p>
        </form>
      </div>

      <div className="legal-footer">
        <p>© 2026 MedCare. Tous droits réservés.</p>
      </div>

    </div>
  );
}

export default AppointmentForm;
