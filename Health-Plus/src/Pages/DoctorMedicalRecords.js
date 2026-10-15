import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import LoadingSpinner from "../Components/LoadingSpinner";
import "../Styles/DoctorDashboard.css";

function DoctorMedicalRecords() {
  const navigate = useNavigate();
  const doctorId = Number(localStorage.getItem("doctorId") || localStorage.getItem("userId") || 0);

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    if (!doctorId) {
      navigate("/login");
      return;
    }

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const recordsRes = await api.getMedicalRecords({ doctor_id: doctorId });
        setMedicalRecords(recordsRes?.data || recordsRes || []);
      } catch (error) {
        console.error("Erreur chargement dossiers médicaux:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [doctorId, navigate]);

  const filteredRecords = useMemo(() => {
    const query = searchName.trim().toLowerCase();
    if (!query) return medicalRecords;

    return medicalRecords.filter((record) => {
      const patientName = (record.patient_name || record.patientName || "").toLowerCase();
      return patientName.includes(query);
    });
  }, [medicalRecords, searchName]);

  if (loading) {
    return <LoadingSpinner label="Chargement des dossiers médicaux…" />;
  }

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-dashboard-header">
        <div>
          <h1>Tous les dossiers médicaux</h1>
          <p>Recherche par nom de patient</p>
        </div>
        <div className="table-actions">
          <button type="button" className="doctor-action-btn" onClick={() => navigate("/doctor-dashboard")}>
            Retour au dashboard
          </button>
        </div>
      </div>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Rechercher par nom du patient..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="control-input"
        />
      </div>

      <div className="medical-records-list">
        {filteredRecords.length === 0 ? (
          <p className="empty-records">Aucun dossier médical trouvé.</p>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="medical-record-item">
              <div className="record-head">
                <strong>{record.patient_name || record.patientName || "Patient"}</strong>
                <span>Créé le {record.created_at || record.createdAt || "-"}</span>
              </div>
              <p>
                <b>Âge:</b> {record.age} | <b>Genre:</b> {record.gender} | <b>Téléphone:</b> {record.phone || "-"}
              </p>
              <p><b>Antécédents:</b> {record.history || "N/A"}</p>
              <p><b>Allergies:</b> {record.allergies || "N/A"}</p>
              <p><b>Diagnostic:</b> {record.diagnosis || "-"}</p>
              <p><b>Traitement/Notes:</b> {record.treatment || "N/A"}</p>
              <p><b>Prix:</b> {Number(record.price || 0).toFixed(2)} MAD</p>
              <div className="table-actions">
                <button
                  type="button"
                  className="accept-btn"
                  onClick={() =>
                    navigate("/doctor-dashboard", {
                      state: { recordToEdit: record },
                    })
                  }
                >
                  Modifier
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DoctorMedicalRecords;
