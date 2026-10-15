import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "react-toastify";
import "../Styles/Login.css";
import { api } from "../api";
import BackButton from "../Components/BackButton";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.login(formData);
      const user = response?.data || response?.user || null;

      if (!user || !user.id) {
        toast.error("Réponse invalide du serveur.");
        return;
      }

      if (!user.token) {
        toast.error("Jeton d'authentification absent de la réponse du serveur.");
        return;
      }

      // Le jeton Sanctum est la seule preuve d'identité acceptée par l'API.
      localStorage.setItem("token", user.token);
      localStorage.setItem("userId", String(user.id));
      localStorage.setItem("userType", user.role);
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("phone", user.phone || "");
      localStorage.setItem("gender", user.gender || "private");

      if (user.role === "doctor") {
        localStorage.setItem("doctorId", String(user.doctor_id || ""));
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (error) {
      // Le serveur renvoie déjà un message FR générique (pas d'énumération de comptes).
      toast.error(error?.message || "Échec de connexion");
    }
  };

  return (
    <div className="login-container">
      <BackButton />
      <div className="login-wrapper">
        <div className="login-header">
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="Entrez votre email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Entrez votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Link to="/forgot-password" className="forgot-password-link">
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>

        <div className="login-footer">
          <p>
            Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
