import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../Styles/ForgotPassword.css";
import { api } from "../api";
import BackButton from "../Components/BackButton";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: emailParam,
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!token) {
      setError("Token de réinitialisation manquant.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.resetPassword({
        email: formData.email,
        token: token,
        password: formData.password,
      });
      setMessage(response?.message || "Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
          <h2>Réinitialiser le mot de passe</h2>
          <p>Entrez votre nouveau mot de passe.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={!!emailParam}
            />
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 caractères"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Répéter le mot de passe"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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

export default ResetPassword;