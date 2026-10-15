import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalSpecialties } from '../data/medicalSpecialties';
import { moroccoCities } from '../data/moroccoCities';
import DoctorCard from '../Components/DoctorCard';
import BackButton from '../Components/BackButton';
import '../Styles/AppointmentPage.css';
import { api } from '../api';
import { appAlert } from '../Scripts/appAlert';
import doctorPicture from '../Assets/doctor-picture.png';

function AppointmentPage() {
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (!userId || userType !== 'patient') {
      appAlert.fire({
        icon: 'warning',
        title: 'Connexion requise',
        text: 'Veuillez vous connecter en tant que patient pour accéder à la page de prise de rendez-vous.',
      }).then(() => {
        navigate('/login');
      });
    }
  }, [navigate, userId, userType]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const doctorsRes = await api.getDoctors();

        const apiDoctors = doctorsRes?.data || [];
        if (mounted && Array.isArray(apiDoctors)) {
          setAllDoctors(apiDoctors);
        }
      } catch (error) {
        console.warn("Chargement API indisponible, aucun fallback local.", error.message);
        if (mounted) {
          setAllDoctors([]);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let filtered = allDoctors;
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(d => d.specialty === filterSpecialty);
    }
    if (filterCity !== 'all') {
      filtered = filtered.filter(d => d.city === filterCity);
    }
    if (searchDoctor.trim() !== '') {
      const search = searchDoctor.trim().toLowerCase();
      filtered = filtered.filter((d) => (d.name || '').toLowerCase().includes(search));
    }
    setFilteredDoctors(filtered);
  }, [filterSpecialty, filterCity, searchDoctor, allDoctors]);

  const handleBookClick = (doctor) => {
    if (!userId || userType !== 'patient') {
      appAlert.fire({
        icon: 'warning',
        title: 'Connexion requise',
        text: 'Veuillez vous connecter en tant que patient pour réserver un rendez-vous.',
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor));
    navigate('/appointment-form');
  };

  const handleRateDoctor = async (doctorId, rating) => {
    if (!userId) {
      appAlert.fire({
        icon: 'warning',
        title: 'Connexion requise',
        text: 'Veuillez vous connecter comme patient.',
      });
      return;
    }

    try {
      await api.rateDoctor(doctorId, rating);
      appAlert.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Évaluation envoyée avec succès.',
      });
    } catch (error) {
      appAlert.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de l'évaluation: " + error.message,
      });
    }
  };

  const specialties = Array.from(new Set([
    ...medicalSpecialties,
    ...allDoctors.map((d) => (d.specialty || '').toLowerCase()).filter(Boolean)
  ]));

  const cities = Array.from(new Set([
    ...moroccoCities,
    ...allDoctors.map((d) => (d.city || '').toLowerCase()).filter(Boolean)
  ]));

  const localDoctorImages = [
    doctorPicture,
  ];

  return (
    <section className="appointment-page">
      <BackButton />
      <div className="appointment-page__hero">
        <div className="appointment-page__hero-inner">
          <span className="appointment-page__badge">Plateforme Santé</span>
          <h1>Prendre un rendez-vous médical</h1>
          <p>
            Trouvez le spécialiste adapté à votre besoin, comparez rapidement les profils
            et réservez en quelques clics.
          </p>
          <div className="appointment-page__hero-stats">
            <div className="hero-stat">
              <strong>{allDoctors.length}+</strong>
              <span>Médecins disponibles</span>
            </div>
            <div className="hero-stat">
              <strong>24h/7j</strong>
              <span>Réservation simplifiée</span>
            </div>
          </div>
        </div>
      </div>

      <div className="appointment-page__container">
        <div className="dt-title-content appointment-page__title-wrap">
          <h3 className="dt-title">
            <span>Nos Docteurs</span>
          </h3>
          <p className="dt-description">
            Filtrez par spécialité et par ville pour identifier le médecin qui vous convient.
          </p>
        </div>

        <div className="filters appointment-filters">
          <div className="filter-field filter-field--search">
            <label>Recherche docteur</label>
            <input
              type="text"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="filter-input"
              placeholder="Nom ou prénom du docteur"
            />
          </div>
          <div className="filter-field">
            <label>Spécialité</label>
            <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="filter-select">
              {specialties.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'Toutes spécialités' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Ville</label>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="filter-select">
              {cities.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'Toutes villes' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <p className="filter-count">
            {filteredDoctors.length} docteur(s) trouvé(s)
          </p>
        </div>

        <div className="dt-cards-content doctors-grid appointment-page__grid">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => {
              const availabilityKey = `doctorAvailability:${doctor.id}`;
              const availabilityValue = localStorage.getItem(availabilityKey);
              const isAvailable = availabilityValue !== "indisponible";

              return (
                <DoctorCard
                  key={doctor.id}
                  img={doctor.photo_url || doctor.img || doctor.photo_path || localDoctorImages[(doctor.id || 0) % localDoctorImages.length]}
                  name={doctor.name}
                  title={doctor.specialty}
                  specialty={doctor.specialty}
                  city={doctor.city}
                  stars={doctor.stars}
                  reviews={doctor.reviews}
                  isAvailable={isAvailable}
                  onBook={() => handleBookClick(doctor)}
                  onRate={(rating) => handleRateDoctor(doctor.id, rating)}
                  canRate={true}
                />
              );
            })
          ) : (
            <div className="no-doctors">
              <h3>Aucun docteur trouvé</h3>
              <p>Essayez d'autres filtres pour élargir les résultats.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AppointmentPage;

