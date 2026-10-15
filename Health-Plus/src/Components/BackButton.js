import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/BackButton.css";

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="global-back-button"
      onClick={() => navigate(-1)}
      aria-label="Retour à la page précédente"
      title="Retour"
    >
      ← Retour
    </button>
  );
}

export default BackButton;
