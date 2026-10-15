import React, { useEffect, useState } from "react";
import Doctor from "../Assets/doctor-picture.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate  } from "react-router-dom";
import { appAlert } from "../Scripts/appAlert";
import "../Styles/Hero.css";

function Hero() {
  const navigate = useNavigate();
  const [goUp, setGoUp] = useState(false);

  const isPatientLoggedIn = () => {
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    return Boolean(userId && userType === 'patient');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  useEffect(() => {
    const onPageScroll = () => {
      if (window.scrollY > 600) {
        setGoUp(true);
      } else {
        setGoUp(false);
      }
    };
    window.addEventListener("scroll", onPageScroll);

    return () => {
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  return (
    <div className="section-container">
      <div className="hero-section">
        <div className="text-section">
          <p className="text-headline">❤️ La santé passe en premier</p>
          <h2 className="text-title">
            Trouvez votre médecin et prenez un rendez-vous
          </h2>
          <p className="text-descritpion">
            Parlez à des médecins en ligne et obtenez des conseils médicaux, des ordonnances en ligne,
            des renouvellements et des certificats médicaux en quelques minutes. Services de santé à la demande à portée de main.
          </p>
          <button
            className="text-appointment-btn"
            type="button"
            onClick={handleBookAppointmentClick}
          >
            <FontAwesomeIcon icon={faCalendarCheck} /> Prendre rendez-vous
          </button>
          <div className="text-stats">
            <div className="text-stats-container">
              <p>145k+</p>
              <p>Patients reçus</p>
            </div>

            <div className="text-stats-container">
              <p>50+</p>
              <p>Médecins experts</p>
            </div>

            <div className="text-stats-container">
              <p>10+</p>
              <p>Années d'expérience</p>
            </div>
          </div>
        </div>

        <div className="hero-image-section">
          <img className="hero-image1" src={Doctor} alt="Médecin" />
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Remonter en haut de page"
        className={`scroll-up ${goUp ? "show-scroll" : ""}`}
      >
        <FontAwesomeIcon icon={faAngleUp} />
      </button>
    </div>
  );
}

export default Hero;
