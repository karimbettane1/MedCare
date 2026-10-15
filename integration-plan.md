# Comprehensive Plan to Complete Health-Plus Project

## 1. Backend Completion (Laravel API)
- [ ] Enable CORS in bootstrap/app.php or config/cors.php
- [ ] Implement AuthController: register (create user + patient_profile), login (with password hash check, return token/JWT)
- [ ] Define all routes in routes/api.php matching api.js: /auth/register, /auth/login, /doctors, /appointments, /medical-records, etc.
- [ ] Implement controllers: DoctorController (index/list), AppointmentController (index, store, update status), MedicalRecordController (index, store)
- [ ] Add relationships in models (User-PatientProfile-Doctor-Appointment-MedicalRecord)
- [ ] Update seeders for testing data

## 2. Frontend Integration (React)
- [ ] Connect src/Pages/inscription.js to api.register (handle form submit, errors, success redirect)
- [ ] Connect src/Pages/Login.js to api.login (handle auth, store token, redirect to dashboard)
- [ ] Update AppointmentPage.js/AppointmentForm.js: use api.getDoctors, api.createAppointment
- [ ] Connect DoctorDashboard.js: api.getAppointments, api.updateAppointmentStatus, api.getMedicalRecords
- [ ] Connect PatientDashboard.js: similar API calls

## 3. Testing & Polish
- [ ] Run backend: php artisan migrate, serve, test endpoints (Postman/browser)
- [ ] Run frontend: npm start, test flows
- [ ] Update TODO.md to [x] all items
- [ ] Add auth headers/token to api.js request()

## Priority Order
1. Backend auth (register/login) + routes/CORS
2. Frontend inscription/Login connection
3. Appointment flow (doctors list + book)
4. Dashboards
5. Remaining controllers/endpoints
