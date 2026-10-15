-- =========================================================
-- Base de données SQL complète pour le projet Health-Plus
-- Alignée avec le backend Laravel actuel
-- =========================================================

CREATE DATABASE IF NOT EXISTS health_plus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE health_plus;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- Table: password_resets
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),
  INDEX idx_password_resets_email (email),
  INDEX idx_password_resets_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NULL,
  last_name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL,
  phone VARCHAR(20) NULL,
  gender ENUM('male', 'female', 'private') NOT NULL DEFAULT 'private',
  role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: doctors
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  specialty VARCHAR(255) NOT NULL DEFAULT 'Médecin Généraliste',
  city VARCHAR(255) NOT NULL DEFAULT 'Non renseignée',
  stars DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
  bio TEXT NULL,
  photo_path VARCHAR(255) NULL,
  photo_url VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_doctors_user UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: patient_profiles
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  birth_date DATE NULL,
  address VARCHAR(500) NULL,
  emergency_contact VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_patient_profiles_user UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: appointments
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  appointment_datetime DATETIME NOT NULL,
  preferred_mode ENUM('voice', 'video') NOT NULL DEFAULT 'video',
  reason VARCHAR(255) NULL,
  status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  rating TINYINT UNSIGNED NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_appointments_patient_date (patient_id, appointment_datetime),
  INDEX idx_appointments_doctor_date (doctor_id, appointment_datetime),
  INDEX idx_appointments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: medical_records
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id BIGINT UNSIGNED NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  age INT UNSIGNED NULL,
  taille DECIMAL(5,2) NULL,
  poids DECIMAL(5,2) NULL,
  gender ENUM('Homme', 'Femme') NOT NULL DEFAULT 'Homme',
  phone VARCHAR(20) NULL,
  history TEXT NULL,
  allergies TEXT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_records_appointment
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_records_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_records_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_medical_records_patient_created (patient_id, created_at),
  INDEX idx_medical_records_doctor_created (doctor_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- Données de démonstration
-- Mot de passe hashé (bcrypt): password123
-- =========================================================

INSERT INTO users (name, first_name, last_name, email, phone, gender, role, password) VALUES
('Dr Karim Alaoui', 'Karim', 'Alaoui', 'doctor@healthplus.test', '0612345678', 'male', 'doctor', '$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC'),
('Ahmed Benali', 'Ahmed', 'Benali', 'patient@healthplus.test', '0623456789', 'male', 'patient', '$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC'),
('Dr Salma Idrissi', 'Salma', 'Idrissi', 'salma.idrissi@healthplus.com', '0634567890', 'female', 'doctor', '$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC'),
('Sara El Idrissi', 'Sara', 'El Idrissi', 'sara.idrissi@mail.com', '0645678901', 'female', 'patient', '$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  phone = VALUES(phone),
  gender = VALUES(gender),
  role = VALUES(role);

INSERT INTO doctors (user_id, specialty, city, stars, reviews_count, bio, photo_path)
SELECT u.id, 'Cardiologue', 'Casablanca', 4.80, 120, 'Spécialiste cardiaque', NULL
FROM users u
WHERE u.email = 'doctor@healthplus.test'
ON DUPLICATE KEY UPDATE
  specialty = VALUES(specialty),
  city = VALUES(city),
  stars = VALUES(stars),
  reviews_count = VALUES(reviews_count),
  bio = VALUES(bio),
  photo_path = VALUES(photo_path);

INSERT INTO doctors (user_id, specialty, city, stars, reviews_count, bio, photo_path)
SELECT u.id, 'Médecin Généraliste', 'Rabat', 4.70, 98, 'Consultations générales et suivi médical', NULL
FROM users u
WHERE u.email = 'salma.idrissi@healthplus.com'
ON DUPLICATE KEY UPDATE
  specialty = VALUES(specialty),
  city = VALUES(city),
  stars = VALUES(stars),
  reviews_count = VALUES(reviews_count),
  bio = VALUES(bio),
  photo_path = VALUES(photo_path);

INSERT INTO patient_profiles (user_id, birth_date, address, emergency_contact)
SELECT u.id, '1990-01-15', 'Casablanca, Maroc', '+330611111111'
FROM users u
WHERE u.email = 'patient@healthplus.test'
ON DUPLICATE KEY UPDATE
  birth_date = VALUES(birth_date),
  address = VALUES(address),
  emergency_contact = VALUES(emergency_contact);

INSERT INTO patient_profiles (user_id, birth_date, address, emergency_contact)
SELECT u.id, '1993-06-20', 'Rabat, Maroc', '+330622222222'
FROM users u
WHERE u.email = 'sara.idrissi@mail.com'
ON DUPLICATE KEY UPDATE
  birth_date = VALUES(birth_date),
  address = VALUES(address),
  emergency_contact = VALUES(emergency_contact);

INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, preferred_mode, reason, status, rating)
SELECT p.id, d.id, '2026-04-23 09:00:00', 'video', 'Douleur thoracique', 'pending', NULL
FROM users p
JOIN users du ON du.email = 'doctor@healthplus.test'
JOIN doctors d ON d.user_id = du.id
WHERE p.email = 'patient@healthplus.test';

INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, preferred_mode, reason, status, rating)
SELECT p.id, d.id, '2026-04-23 10:30:00', 'video', 'Contrôle diabète', 'accepted', 5
FROM users p
JOIN users du ON du.email = 'salma.idrissi@healthplus.com'
JOIN doctors d ON d.user_id = du.id
WHERE p.email = 'sara.idrissi@mail.com';

INSERT INTO medical_records (
  appointment_id, patient_id, doctor_id, age, taille, poids, gender, phone, history, allergies, diagnosis, treatment, price
)
SELECT
  a.id,
  p.id,
  d.id,
  45,
  175.00,
  78.50,
  'Homme',
  '+330600000003',
  'Antécédents familiaux cardiaques',
  'Aucune allergie connue',
  'Suspicion angine de poitrine',
  'ECG + bilan sanguin + traitement initial',
  340.00
FROM appointments a
JOIN users p ON p.id = a.patient_id
JOIN doctors d ON d.id = a.doctor_id
WHERE p.email = 'patient@healthplus.test'
ORDER BY a.id ASC
LIMIT 1;
