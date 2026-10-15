import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

function DoctorCard(props) {
  const [showRatingActions, setShowRatingActions] = useState(false);

  const handleBook = () => {
    if (props.onBook) {
      props.onBook(props);
    }
  };

  const handleRateClick = () => {
    setShowRatingActions((prev) => !prev);
  };

  const handleRate = (rating) => {
    if (props.onRate) {
      props.onRate(rating);
      setShowRatingActions(false);
    }
  };

  const normalizedImage = useMemo(() => {
    if (!props.img || typeof props.img !== "string") return "";
    const trimmed = props.img.trim();
    if (!trimmed) return "";

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    if (trimmed.startsWith("/storage/")) {
      return `${BASE_URL}${trimmed}`;
    }

    if (trimmed.startsWith("/photo/")) {
      return `${BASE_URL}/storage${trimmed}`;
    }

    if (trimmed.includes("public/photo/")) {
      const filePart = trimmed.split("public/photo/")[1];
      return filePart ? `${BASE_URL}/storage/photo/${filePart}` : "";
    }

    if (trimmed.startsWith("storage/")) {
      return `${BASE_URL}/${trimmed}`;
    }

    if (trimmed.startsWith("photo/")) {
      return `${BASE_URL}/storage/${trimmed}`;
    }

    return `${BASE_URL}/storage/${trimmed.replace(/^\/+/, "")}`;
  }, [props.img]);

  const doctorInitials = useMemo(() => {
    const name = (props.name || "").trim();
    if (!name) return "DR";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [props.name]);

  const [showFallbackAvatar, setShowFallbackAvatar] = useState(!normalizedImage);

  useEffect(() => {
    setShowFallbackAvatar(!normalizedImage);
  }, [normalizedImage]);

  const handleImageError = () => {
    setShowFallbackAvatar(true);
  };

  return (
    <article className="dt-card">
      <div className="dt-card-media">
        {!showFallbackAvatar ? (
          <img src={normalizedImage} alt={props.name} className="dt-card-img" onError={handleImageError} />
        ) : (
          <div className="dt-card-avatar-fallback" aria-label={`Avatar de ${props.name || "médecin"}`}>
            {doctorInitials}
          </div>
        )}
        <span className={`dt-card-badge ${props.isAvailable === false ? "unavailable" : "available"}`}>
          {props.isAvailable === false ? "Indisponible" : "Disponible"}
        </span>
      </div>

      <div className="dt-card-body">
        <div className="dt-card-top">
          <p className="dt-card-name">{props.name}</p>
          <p className="dt-card-title">{props.title}</p>
        </div>

        <p className="dt-card-specialty-city">
          <span className="label">Spécialité</span> {props.specialty}
          <span className="dot">•</span>
          <span className="label">Ville</span> {props.city}
        </p>

        <p className="dt-card-stars">
          <FontAwesomeIcon
            icon={faStar}
            style={{ color: "#F7BB50", paddingRight: "6px" }}
          />
          {props.stars ?? 0}
          <span className="dt-card-reviews"> ({props.reviews ?? 0}+ avis)</span>
        </p>

        <div className="dt-card-meta">
          <span className="dt-card-meta-chip">Consultation en ligne</span>
          <span className="dt-card-meta-chip">{props.isAvailable === false ? "Prochain créneau à confirmer" : "Créneau rapide disponible"}</span>
        </div>

        <div className="dt-card-actions">
          <button className="book-btn" onClick={handleBook}>
            Prendre Rendez-vous
          </button>

          <button
            className={`rate-btn ${!props.canRate ? 'disabled' : ''}`}
            onClick={handleRateClick}
          >
            Évaluer ce médecin
          </button>
        </div>

        {showRatingActions && (
          <div className="rate-actions">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="star-rate-btn"
                onClick={() => handleRate(star)}
                disabled={!props.canRate}
              >
                {star}★
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default DoctorCard;
