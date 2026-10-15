import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/PatientDashboard.css';
import { api } from '../api';
import { appAlert } from '../Scripts/appAlert';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Patient',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phone') || '',
    gender: localStorage.getItem('gender') || 'Homme',
    userType: localStorage.getItem('userType') || 'patient',
    joined: '...'
  });

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [editProfile, setEditProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const [profileRes, appointmentsRes, recordsRes] = await Promise.all([
          api.getProfile(userId),
          api.getAppointments({ patient_id: userId }),
          api.getMedicalRecords({ patient_id: userId })
        ]);

        setProfile({
          ...profileRes.data,
          userType: profileRes.data.role,
          joined: profileRes.data.created_at
        });

        const rawAppointments = appointmentsRes.data || appointmentsRes || [];
        setAppointments(
          rawAppointments.map((app) => {
            const dt = new Date(app.appointment_datetime);
            return {
              id: app.id,
              doctor: app.doctor_name,
              date: dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawStatus: app.status,
              status:
                app.status === 'pending'
                  ? 'En attente'
                  : app.status === 'accepted'
                  ? 'Confirmé'
                  : app.status === 'rejected'
                  ? 'Refusé'
                  : app.status === 'completed'
                  ? 'Terminé'
                  : app.status,
              rating: app.rating || null
            };
          })
        );

        const rawRecords = recordsRes.data || recordsRes || [];
        setMedicalRecords(
          rawRecords.map((rec) => ({
            date: rec.created_at,
            diagnosis: rec.diagnosis,
            treatment: rec.treatment,
            doctor: rec.doctor_name
          }))
        );
      } catch (error) {
        console.error('Erreur fetch patient data:', error);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    const names = (profile.name || '').split(' ');
    setEditProfile({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: profile.email || '',
      phone: profile.phone || ''
    });
  }, [profile.name, profile.email, profile.phone]);

  const profileCompletion = useMemo(() => {
    const fields = [profile.name, profile.email, profile.phone, profile.gender];
    const filled = fields.filter((v) => String(v || '').trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.rawStatus === 'pending').length;
    const confirmed = appointments.filter((a) => a.rawStatus === 'accepted').length;
    const completed = appointments.filter((a) => a.rawStatus === 'completed').length;
    const records = medicalRecords.length;
    return { total, pending, confirmed, completed, records };
  }, [appointments, medicalRecords]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const bookAppointment = () => {
    navigate('/appointment');
  };

  const handleRateDoctor = async (appointmentId, rating) => {
    try {
      await api.submitDoctorRating(appointmentId, userId, rating);
      setAppointments((prev) => prev.map((app) => (app.id === appointmentId ? { ...app, rating } : app)));
      appAlert.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Évaluation envoyée avec succès.'
      });
    } catch (error) {
      appAlert.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de l'évaluation: " + error.message
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.updateProfile(userId, {
        first_name: editProfile.firstName,
        last_name: editProfile.lastName,
        email: editProfile.email,
        phone: editProfile.phone
      });

      const updatedUser = response.data;
      setProfile((prev) => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }));

      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('email', updatedUser.email);
      localStorage.setItem('phone', updatedUser.phone);

      setActiveTab('profile');
      appAlert.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Profil mis à jour avec succès!'
      });
    } catch (error) {
      appAlert.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour: ' + error.message
      });
    }
  };

  const handlePrintRecord = (record) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
      appAlert.fire({
        icon: 'warning',
        title: 'Impression bloquée',
        text: 'Veuillez autoriser les popups pour imprimer le dossier médical.'
      });
      return;
    }

    const diagnosis = record?.diagnosis || 'Non renseigné';
    const treatment = record?.treatment || 'Non renseigné';
    const doctor = record?.doctor || 'Non renseigné';
    const date = record?.date ? new Date(record.date).toLocaleString('fr-FR') : 'Non renseignée';
    const patientName = profile?.name || 'Patient';

    printWindow.document.write(`
      <html>
        <head>
          <title>Dossier Médical - Health-Plus</title>
          <style>
            :root {
              --print-primary: #2563eb;
              --print-text: #0f172a;
              --print-muted: #475569;
              --print-border: #cbd5e1;
              --print-soft: #f8fafc;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: "Inter", "Segoe UI", Arial, sans-serif;
              color: var(--print-text);
              background: #ffffff;
              padding: 0;
            }
            .sheet {
              border: 1px solid #111;
              margin: 12mm;
              padding: 14mm;
            }
            .print-header {
              border-bottom: 2px solid #111;
              padding-bottom: 5mm;
              margin-bottom: 8mm;
            }
            .site-name {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: 0.03em;
              color: #111;
            }
            .doc-title {
              margin: 4px 0 8px;
              font-size: 18px;
              font-weight: 700;
              color: var(--print-primary);
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px 14px;
              margin-top: 6px;
            }
            .meta-item {
              font-size: 13px;
              color: var(--print-muted);
            }
            .meta-item strong { color: #111; }
            .field {
              margin-bottom: 12px;
              border: 1px solid var(--print-border);
              border-radius: 8px;
              background: var(--print-soft);
              padding: 10px 12px;
            }
            .label {
              display: block;
              margin-bottom: 4px;
              font-size: 12px;
              font-weight: 700;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }
            .value {
              font-size: 14px;
              line-height: 1.5;
              white-space: pre-wrap;
              color: #0f172a;
            }
            .footer-note {
              margin-top: 10mm;
              padding-top: 4mm;
              border-top: 1px dashed #94a3b8;
              font-size: 12px;
              color: #64748b;
              text-align: center;
            }
            @page {
              size: A4;
              margin: 8mm;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="print-header">
              <h1 class="site-name">Health-Plus</h1>
              <p class="doc-title">Dossier Médical Patient</p>
              <div class="meta-grid">
                <div class="meta-item"><strong>Patient:</strong> ${patientName}</div>
                <div class="meta-item"><strong>Médecin:</strong> ${doctor}</div>
                <div class="meta-item"><strong>Date du dossier:</strong> ${date}</div>
                <div class="meta-item"><strong>Date d'impression:</strong> ${new Date().toLocaleString('fr-FR')}</div>
              </div>
            </div>
            <div class="field">
              <span class="label">Diagnostic</span>
              <div class="value">${diagnosis}</div>
            </div>
            <div class="field">
              <span class="label">Traitement</span>
              <div class="value">${treatment}</div>
            </div>
            <div class="footer-note">
              Document généré depuis la plateforme Health-Plus.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };


  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="profile-card">
          <div className="profile-avatar">
            {(profile.name || 'P')
              .split(' ')
              .map((n) => n[0] || '')
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <h3>{profile.name}</h3>
          <p>{profile.userType}</p>
        </div>

        <nav className="dashboard-nav">
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            Profil
          </button>
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
            Mes Rendez-vous
          </button>
          <button className={activeTab === 'medical' ? 'active' : ''} onClick={() => setActiveTab('medical')}>
            Dossier Médical
          </button>
          <button className="book-btn" onClick={bookAppointment}>
            Prendre RDV
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Tableau de Bord Patient</h1>
            <p>Bienvenue, gérez vos informations et suivez vos rendez-vous en temps réel.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="new-appointment-btn" onClick={bookAppointment}>Prendre RDV</button>
            <button className="logout-btn mobile-only" onClick={handleLogout}>Déconnexion</button>
          </div>
        </div>

        <div className="stats-strip">
          <div className="mini-stat">
            <span>Total RDV</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="mini-stat pending">
            <span>En attente</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="mini-stat confirmed">
            <span>Confirmés</span>
            <strong>{stats.confirmed}</strong>
          </div>
          <div className="mini-stat done">
            <span>Terminés</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className="mini-stat completion">
            <span>Profil complété</span>
            <strong>{profileCompletion}%</strong>
          </div>
          <div className="mini-stat records">
            <span>Dossiers médicaux</span>
            <strong>{stats.records}</strong>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>Mon Profil</h2>
            <div className="profile-section">
              <div className="edit-toggle">
                <button className="edit-btn" onClick={() => setActiveTab('edit-profile')}>
                  ✏️ Modifier
                </button>
              </div>
              <div className="profile-details">
                <div className="detail-item"><label>Nom complet</label><span>{profile.name}</span></div>
                <div className="detail-item"><label>Email</label><span>{profile.email || '-'}</span></div>
                <div className="detail-item"><label>Téléphone</label><span>{profile.phone || '-'}</span></div>
                <div className="detail-item"><label>Genre</label><span>{profile.gender || '-'}</span></div>
                <div className="detail-item">
                  <label>Type de compte</label>
                  <span>{profile.userType === 'patient' ? 'Patient' : 'Médecin'}</span>
                </div>
                <div className="detail-item"><label>Date d'inscription</label><span>{profile.joined || '-'}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit-profile' && (
          <div className="tab-content">
            <h2>Modifier Profil</h2>
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={editProfile.firstName}
                    onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={editProfile.lastName}
                    onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={editProfile.phone}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveProfile}>💾 Sauvegarder</button>
                <button className="cancel-btn" onClick={() => setActiveTab('profile')}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="tab-content">
            <h2>Mes Rendez-vous</h2>
            <div className="appointments-list">
              {appointments.length === 0 ? (
                <p className="empty-medical-records">Aucun rendez-vous trouvé pour le moment.</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-info">
                      <h4>{appointment.doctor}</h4>
                      <p>{appointment.date}</p>
                    </div>
                    <div className={`status ${appointment.status.toLowerCase().replace(' ', '-')}`}>{appointment.status}</div>

                    {appointment.rawStatus === 'completed' && (
                      <div className="rating-box">
                        {appointment.rating ? (
                          <p>Votre note: {'★'.repeat(appointment.rating)}{'☆'.repeat(5 - appointment.rating)}</p>
                        ) : (
                          <div className="rating-actions">
                            <p>Noter ce médecin:</p>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} className="star-btn" onClick={() => handleRateDoctor(appointment.id, star)}>
                                {star}★
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <button className="new-appointment-btn" onClick={bookAppointment}>Nouveau Rendez-vous</button>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="tab-content">
            <h2>Dossier Médical</h2>
            <div className="medical-records">
              {medicalRecords.length === 0 ? (
                <p className="empty-medical-records">Aucun dossier médical à imprimer pour le moment.</p>
              ) : (
                medicalRecords.map((record, index) => (
                  <div key={index} className="medical-record">
                    <div className="record-date">{record.date}</div>
                    <div className="record-details">
                      <h4>Diagnostic: {record.diagnosis}</h4>
                      <p>Traitement: {record.treatment}</p>
                      <p>Médecin: {record.doctor}</p>
                    </div>
                    <div className="record-actions">
                      <button type="button" className="print-record-btn" onClick={() => handlePrintRecord(record)}>
                        Imprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
