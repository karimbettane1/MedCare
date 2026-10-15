import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Home from "./Pages/Home";
// import registarction.css

import "./Styles/RegistrationForm.css";
import Registration from "./Pages/inscription";
import Legal from "./Pages/Legal";
import NotFound from "./Pages/NotFound";
import Appointment from "./Pages/Appointment";
import AppointmentFormPage from "./Pages/AppointmentFormPage";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import PatientDashboard from "./Pages/PatientDashboard";
import DoctorDashboard from "./Pages/DoctorDashboard";
import DoctorMedicalRecords from "./Pages/DoctorMedicalRecords";
import Chat from "./Pages/Chat";

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL || "/"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment-form" element={<AppointmentFormPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-medical-records" element={<DoctorMedicalRecords />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/inscription" element={<Registration />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={4000} limit={3} />
      </Router>
    </div>
  );
}

export default App;
