import React from "react";
import Doctor from "../Assets/doctor-book-appointment.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { appAlert } from "../Scripts/appAlert";
import "../Styles/BookAppointment.css";

function BookAppointment() {
  const navigate = useNavigate();

  const isPatientLoggedIn = () => {
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    return Boolean(userId && userType === 'patient');
  };

  const handleBookAppointmentClick = () => {
    if (!isPatientLoggedIn()) {
      appAlert.fire({
        icon: 'warning',
        title: 'Connexion requise',
        text: 'Veuillez vous connecter en tant que patient pour prendre un rendez-vous.',
        confirmButtonText: 'Se connecter',
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    navigate("/appointment");
  };

  return (
    <div className="ba-section">
      <div className="ba-image-content">
        <img src={Doctor} alt="Médecin prenant RDV" className="ba-image1" />
      </div>

      <div className="ba-text-content">
        <h3 className="ba-title">
          <span>Pourquoi choisir Health</span>
        </h3>
        <p className="ba-description">
          Découvrez les raisons de choisir MedCare pour vos besoins en matière de santé.
          Profitez de soins experts, de la commodité et de solutions personnalisées, en faisant de votre bien-être notre priorité absolue.
          Rejoignez-nous dans un parcours vers une meilleure santé et une vie plus heureuse.
        </p>

        <p className="ba-checks ba-check-first">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> Meilleurs médecins professionnels
        </p>
        <p className="ba-checks">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> Soins d'urgence
        </p>
        <p className="ba-checks">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> Support Chat 24/7
        </p>
        <p className="ba-checks ba-check-last">
          <FontAwesomeIcon icon={faCircleCheck} style={{ color: "#1E8FFD" }} /> Inscription facile et rapide
        </p>

        <button
          className="text-appointment-btn"
          type="button"
          onClick={handleBookAppointmentClick}
        >
          <FontAwesomeIcon icon={faCalendarCheck} /> Prendre rendez-vous
        </button>
      </div>
    </div>
  );
}

export default BookAppointment;
