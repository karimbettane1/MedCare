
import React, { useState } from 'react';
import { api } from '../api.js';
import { Link, useNavigate } from 'react-router-dom';
import { medicalSpecialties } from '../data/medicalSpecialties';
import '../Styles/RegistrationForm.css'; // Fichier CSS optionnel
import BackButton from "../Components/BackButton";
import { appAlert } from '../Scripts/appAlert';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const specialtyOptions = medicalSpecialties.filter((item) => item !== 'all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: 'Homme',
    userType: 'patient',
    specialty: '',
    city: '',
    address: '',
    bio: '',
    photo: null,
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? (files?.[0] || null) : value)
    });
  };

    const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!formData.userType) newErrors.userType = 'Le type de compte est requis';

    const emailValue = formData.email.trim();
    if (!emailValue) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    const normalizedPhone = formData.phone.replace(/[\s-]/g, '').trim();
    if (!normalizedPhone) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^(06|07)\d{8}$/.test(normalizedPhone)) {
      newErrors.phone = 'Numéro invalide. Format: 06/07 + 8 chiffres (ex: 0612345678)';
    }

    if (formData.userType === 'doctor') {
      if (!formData.specialty.trim()) newErrors.specialty = 'La spécialité est requise';
      if (!formData.city.trim()) newErrors.city = 'La ville est requise';
      if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Mapper les données vers le format backend
      const registerData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        gender: formData.gender === 'Homme' ? 'male' : 'female',
        role: formData.userType,
      };

      if (formData.userType === 'doctor') {
        registerData.specialty = formData.specialty.trim();
        registerData.city = formData.city.trim();
        registerData.address = formData.address.trim();
        registerData.bio = formData.bio.trim();
      }

      let payload = registerData;
      if (formData.userType === 'doctor' && formData.photo) {
        const formPayload = new FormData();
        Object.entries(registerData).forEach(([key, value]) => {
          formPayload.append(key, value ?? '');
        });
        formPayload.append('photo', formData.photo);
        payload = formPayload;
      }

      // Appel API réel vers backend Laravel
      const response = await api.register(payload);
      
      console.log('Inscription réussie:', response);
      
      // Stocker les infos utiles
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('userName', registerData.name);
      localStorage.setItem('email', registerData.email);
      localStorage.setItem('phone', registerData.phone);
      localStorage.setItem('gender', registerData.gender);
      if (formData.userType === 'doctor') {
        localStorage.setItem('doctorSpecialty', formData.specialty.trim());
        localStorage.setItem('doctorCity', formData.city.trim());
        localStorage.setItem('doctorAddress', formData.address.trim());
        localStorage.setItem('doctorBio', formData.bio.trim());
      }
      
      setSuccess(true);
      appAlert.fire({
        icon: 'success',
        title: 'Inscription réussie',
        text: 'Vous allez être redirigé vers la page de connexion.',
        timer: 1800,
        showConfirmButton: false
      });
      
      // Reset formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: 'Homme',
        userType: 'patient',
        specialty: '',
        city: '',
        address: '',
        bio: '',
        photo: null,
        acceptTerms: false
      });
      
      // Redirection vers login après 2s
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur inscription:', error);
      setErrors({ submit: error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

 
  

  return (
    <div className="registration-container">
      <BackButton />
      <div className="registration-form-wrapper">
        <div className="form-header">
          <h2>Inscription</h2>
          <p>Créez votre compte maintenant</p>
        </div>

        {success && null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            placeholder="06 12 34 56 78"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Genre *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
            {errors.gender && <span className="error-text">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label>Type de compte *</label>
            <div className="account-type-buttons">
              <button
                type="button"
                className={`account-type-btn ${formData.userType === "patient" ? "active" : ""}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: "patient" }))}
              >
                Inscription Patient
              </button>
              <button
                type="button"
                className={`account-type-btn doctor ${formData.userType === "doctor" ? "active" : ""}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: "doctor" }))}
              >
                Inscription Médecin
              </button>
            </div>
            <input type="hidden" name="userType" value={formData.userType} />
            {errors.userType && <span className="error-text">{errors.userType}</span>}
          </div>

          {formData.userType === 'doctor' && (
            <section className="doctor-extra-section">
              <h3>Informations Médecin</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialty">Spécialité *</label>
                  <select
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className={errors.specialty ? 'error' : ''}
                  >
                    <option value="">Sélectionnez une spécialité</option>
                    {specialtyOptions.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.specialty && <span className="error-text">{errors.specialty}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">Ville *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    placeholder="Ex: Casablanca"
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Adresse du cabinet"
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="photo">Photo de profil médecin</label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio / Description</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Présentation rapide du médecin"
                  className="doctor-bio-textarea"
                />
              </div>
            </section>
          )}

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                <span className="terms-prefix">J'accepte les</span>
                <Link to="/legal" className="terms-link">
                  conditions d'utilisation
                </Link>
                <span className="terms-required">*</span>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>

          {errors.submit && <div className="error-submit">{errors.submit}</div>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="form-footer">
          <p>Déjà un compte ? <Link to="/login" className="login-link">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
