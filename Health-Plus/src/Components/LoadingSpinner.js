import React from "react";

function LoadingSpinner({ label = "Chargement en cours…" }) {
  return (
    <div className="hp-loading" role="status" aria-live="polite">
      <span className="hp-loading__spinner" aria-hidden="true"></span>
      <p className="hp-loading__label">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
