import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { toast } from "react-toastify";
import LoadingSpinner from "../Components/LoadingSpinner";
import "../Styles/DoctorDashboard.css";

const defaultMedicalRecord = {
  patient_id: "",
  age: "",
  gender: "Homme",
  phone: "",
  history: "",
  allergies: "",
  diagnosis: "",
  treatment: "",
  price: "",
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Docteur";
  const doctorId = Number(localStorage.getItem("doctorId") || localStorage.getItem("userId") || 0);

  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medicalRecordForm, setMedicalRecordForm] = useState(defaultMedicalRecord);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  const [recordError, setRecordError] = useState("");
  const [recordSuccess, setRecordSuccess] = useState("");
  const [editingRecordId, setEditingRecordId] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      navigate("/login");
      return;
    }

    const savedAvailability = localStorage.getItem(`doctorAvailability:${doctorId}`);
    if (savedAvailability === "indisponible") {
      setIsAvailable(false);
    } else {
      setIsAvailable(true);
    }
  }, [doctorId, navigate]);

  useEffect(() => {
    const recordToEdit = location.state?.recordToEdit;
    if (!recordToEdit) return;

    setRecordError("");
    setRecordSuccess("");
    setEditingRecordId(recordToEdit.id);
    setMedicalRecordForm({
      patient_id: String(recordToEdit.patient_id || ""),
      age: String(recordToEdit.age ?? ""),
      gender: recordToEdit.gender || "Homme",
      phone: recordToEdit.phone || "",
      history: recordToEdit.history || "",
      allergies: recordToEdit.allergies || "",
      diagnosis: recordToEdit.diagnosis || "",
      treatment: recordToEdit.treatment || "",
      price: String(recordToEdit.price ?? ""),
    });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorId) return;
      try {
        setLoading(true);

        const [appointmentsRes, recordsRes] = await Promise.all([
          api.getAppointments({ doctor_id: doctorId }),
          api.getMedicalRecords({ doctor_id: doctorId }),
        ]);

        const rawAppointments = appointmentsRes?.data || appointmentsRes || [];
        const mappedAppointments = rawAppointments.map((app) => {
          const dt = app.appointment_datetime ? new Date(app.appointment_datetime) : null;
          return {
            ...app,
            patient: app.patient_name || app.patient || "Patient Inconnu",
            date: dt ? dt.toLocaleDateString() : "-",
            time: dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
          };
        });

        setAppointments(mappedAppointments);
        setMedicalRecords(recordsRes?.data || recordsRes || []);
      } catch (error) {
        console.error("Erreur fetch data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const matchesSearch = (appointment.patient || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const availablePatients = useMemo(() => {
    const map = new Map();
    appointments.forEach((app) => {
      if (app.patient_id && !map.has(app.patient_id)) {
        map.set(app.patient_id, app.patient || app.patient_name || "Patient");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [appointments]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const accepted = appointments.filter((a) => a.status === "accepted").length;
    const rejected = appointments.filter((a) => a.status === "rejected").length;
    return { total, pending, accepted, rejected };
  }, [appointments]);

  const monthlyAmount = useMemo(() => {
    return medicalRecords.reduce((sum, record) => {
      const price = Number(record.price ?? 0);
      return Number.isFinite(price) ? sum + price : sum;
    }, 0);
  }, [medicalRecords]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleToggleAvailability = () => {
    if (!doctorId) return;
    const next = !isAvailable;
    setIsAvailable(next);
    localStorage.setItem(`doctorAvailability:${doctorId}`, next ? "disponible" : "indisponible");
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? { ...appointment, status: newStatus } : appointment
        )
      );
      toast.success("Rendez-vous mis à jour");
    } catch (error) {
      console.error("Erreur update status:", error);
      toast.error("Erreur de mise à jour");
    }
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "En attente";
    if (status === "accepted") return "Accepté";
    if (status === "rejected") return "Refusé";
    return status || "-";
  };

  const handleRecordChange = (event) => {
    const { name, value } = event.target;
    setMedicalRecordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    setRecordError("");
    setRecordSuccess("");

    if (
      !medicalRecordForm.patient_id ||
      !medicalRecordForm.age ||
      !medicalRecordForm.diagnosis.trim() ||
      medicalRecordForm.price === ""
    ) {
      setRecordError("Veuillez sélectionner un patient et remplir les champs obligatoires (âge, diagnostic, prix).");
      return;
    }

    try {
      const selectedPatient = availablePatients.find(
        (p) => String(p.id) === String(medicalRecordForm.patient_id)
      );

      const payload = {
        patient_id: Number(medicalRecordForm.patient_id),
        doctor_id: doctorId,
        age: Number(medicalRecordForm.age),
        gender: medicalRecordForm.gender,
        phone: medicalRecordForm.phone || "",
        history: medicalRecordForm.history || "",
        allergies: medicalRecordForm.allergies || "",
        diagnosis: medicalRecordForm.diagnosis,
        treatment: medicalRecordForm.treatment || "",
        price: Number(medicalRecordForm.price),
      };

      if (editingRecordId) {
        const updated = await api.updateMedicalRecord(editingRecordId, payload);
        const updatedRecord = (updated && (updated.data?.data || updated.data)) || {};

        setMedicalRecords((prev) =>
          prev.map((record) =>
            record.id === editingRecordId
              ? {
                  ...record,
                  ...updatedRecord,
                  patient_name:
                    selectedPatient?.name || record.patient_name || record.patientName || "Patient",
                }
              : record
          )
        );
        setRecordSuccess("Dossier médical mis à jour avec succès.");
      } else {
        const created = await api.createMedicalRecord(payload);
        const createdRecord = (created && (created.data?.data || created.data)) || {
          ...payload,
          id: Date.now(),
          patient_name: selectedPatient?.name || "Patient",
          created_at: new Date().toISOString(),
        };

        setMedicalRecords((prev) => [createdRecord, ...prev]);
        setRecordSuccess("Dossier médical créé avec succès.");
      }

      setEditingRecordId(null);
      setMedicalRecordForm(defaultMedicalRecord);
    } catch (error) {
      setRecordError(
        editingRecordId
          ? `Erreur modification dossier: ${error.message}`
          : `Erreur création dossier: ${error.message}`
      );
    }
  };


  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setMedicalRecordForm(defaultMedicalRecord);
    setRecordError("");
    setRecordSuccess("");
  };

  if (loading) return <LoadingSpinner label="Chargement du tableau de bord…" />;

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-dashboard-header">
        <div>
          <h1>Dashboard Médecin</h1>
          <p>Bienvenue, {userName}</p>
          <span className={`doctor-availability-badge ${isAvailable ? "available" : "unavailable"}`}>
            {isAvailable ? "Disponible" : "Indisponible"}
          </span>
        </div>
        <div className="table-actions">
          <button
            type="button"
            onClick={handleToggleAvailability}
            className={`doctor-availability-btn ${isAvailable ? "available" : "unavailable"}`}
          >
            {isAvailable ? "Passer en indisponible" : "Passer en disponible"}
          </button>
          <button onClick={handleLogout} className="doctor-logout-btn">
            Se déconnecter
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total RDV</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card pending">
          <span>En attente</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="stat-card accepted">
          <span>Acceptés</span>
          <strong>{stats.accepted}</strong>
        </div>
        <div className="stat-card rejected">
          <span>Refusés</span>
          <strong>{stats.rejected}</strong>
        </div>
        <div className="stat-card monthly-amount">
          <span>Montant du mois</span>
          <strong>{monthlyAmount.toFixed(2)} MAD</strong>
        </div>
      </div>

      <div className="dashboard-controls">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="control-input"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Accepté</option>
          <option value="rejected">Refusé</option>
        </select>

        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="control-input"
        />

        <button
          type="button"
          className="doctor-action-btn"
          onClick={() => navigate("/doctor-medical-records")}
        >
          Afficher tous les dossiers médicaux
        </button>
      </div>

      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Motif</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  Aucun rendez-vous trouvé.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason || "-"}</td>
                  <td>
                    <span className={`status-badge ${appointment.status}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleStatusUpdate(appointment.id, "accepted")}
                      >
                        Accepter
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusUpdate(appointment.id, "rejected")}
                      >
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="medical-record-section">
        <h2>{editingRecordId ? "Modifier un dossier médical" : "Créer un dossier médical"}</h2>
        <form className="medical-record-form print-area" onSubmit={handleCreateRecord}>
          <div className="record-grid">
            <label>
              <span className="field-label">Patient *</span>
              <select
                name="patient_id"
                value={medicalRecordForm.patient_id}
                onChange={handleRecordChange}
              >
                <option value="">Sélectionner un patient *</option>
                {availablePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Âge *</span>
              <input
                type="number"
                name="age"
                placeholder="Âge *"
                value={medicalRecordForm.age}
                onChange={handleRecordChange}
                min="0"
              />
            </label>

            <label>
              <span className="field-label">Genre</span>
              <select name="gender" value={medicalRecordForm.gender} onChange={handleRecordChange}>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </label>

            <label>
              <span className="field-label">Téléphone</span>
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                value={medicalRecordForm.phone}
                onChange={handleRecordChange}
              />
            </label>

            <label>
              <span className="field-label">Prix *</span>
              <input
                type="number"
                name="price"
                placeholder="Prix *"
                value={medicalRecordForm.price}
                onChange={handleRecordChange}
                min="0"
                step="0.01"
              />
            </label>

            <label>
              <span className="field-label">Antécédents médicaux</span>
              <textarea
                name="history"
                placeholder="Antécédents médicaux"
                value={medicalRecordForm.history}
                onChange={handleRecordChange}
              />
            </label>

            <label>
              <span className="field-label">Allergies</span>
              <textarea
                name="allergies"
                placeholder="Allergies"
                value={medicalRecordForm.allergies}
                onChange={handleRecordChange}
              />
            </label>

            <label>
              <span className="field-label">Diagnostic *</span>
              <textarea
                name="diagnosis"
                placeholder="Diagnostic *"
                value={medicalRecordForm.diagnosis}
                onChange={handleRecordChange}
              />
            </label>

            <label>
              <span className="field-label">Traitement / Notes</span>
              <textarea
                name="treatment"
                placeholder="Traitement / Notes"
                value={medicalRecordForm.treatment}
                onChange={handleRecordChange}
              />
            </label>
          </div>

          {recordError && <p className="record-message error">{recordError}</p>}
          {recordSuccess && <p className="record-message success">{recordSuccess}</p>}

          <div className="table-actions no-print">
            <button type="submit" className="doctor-action-btn">
              {editingRecordId ? "Mettre à jour dossier médical" : "Créer dossier médical"}
            </button>
            <button type="button" className="doctor-action-btn print-btn" onClick={() => window.print()}>
              Imprimer le dossier
            </button>
            {editingRecordId && (
              <button type="button" className="reject-btn" onClick={handleCancelEdit}>
                Annuler modification
              </button>
            )}
          </div>

          <div className="print-header only-print">
            <h1>Health-Plus</h1>
            <p>Dossier Médical</p>
            <p>Médecin: {userName}</p>
            <p>Date d'impression: {new Date().toLocaleDateString()}</p>
          </div>
        </form>

      </section>

    </div>
  );
}

export default DoctorDashboard;
