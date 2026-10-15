import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/ForgotPassword.css";
import { api } from "../api";
import BackButton from "../Components/BackButton";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.forgotPassword({ email });
      setMessage(response?.message || "Un email de réinitialisation a été envoyé si ce compte existe.");
    } catch (err) {
      const msg = err?.message || "Une erreur s'est produite.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <BackButton />
      <div className="forgot-password-wrapper">
        <div className="forgot-password-header">
          <h2>Mot de passe oublié</h2>
          <p>
            Saisissez votre adresse email ci-dessous et nous vous enverrons un
            lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;