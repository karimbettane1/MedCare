import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "../Components/AppointmentForm";
import BackButton from "../Components/BackButton";
import "../Styles/AppointmentForm.css";

function AppointmentFormPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (!userId || userType !== 'patient') {
      navigate('/login');
    }
  }, [navigate, userId, userType]);

  const handleClose = () => {
    sessionStorage.removeItem("selectedDoctor");
    navigate("/appointment");
  };

  const selectedDoctor = sessionStorage.getItem("selectedDoctor");
  const doctorName = selectedDoctor
    ? JSON.parse(selectedDoctor).name
    : "Médecin sélectionné";

  return (
    <div className="appointment-form-page">
      <BackButton />
      <div className="appointment-form-hero">
        <button className="back-btn" onClick={handleClose}>
          ← Retour aux médecins
        </button>
        <h1>Prendre un rendez-vous</h1>
        <p>
          Complétez ce formulaire pour confirmer votre consultation avec{" "}
          <strong>{doctorName}</strong>.
        </p>
      </div>
      <AppointmentForm />
    </div>
  );
}

export default AppointmentFormPage;

