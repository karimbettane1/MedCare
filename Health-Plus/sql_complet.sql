-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: health_plus
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `health_plus`
--

/*!40000 DROP DATABASE IF EXISTS `health_plus`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `health_plus` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `health_plus`;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `preferred_mode` enum('voice','video') NOT NULL DEFAULT 'video',
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `rating` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appointments_patient_date` (`patient_id`,`appointment_datetime`),
  KEY `idx_appointments_doctor_date` (`doctor_id`,`appointment_datetime`),
  KEY `idx_appointments_status` (`status`),
  CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,2,1,'2026-04-23 09:00:00','video','Douleur thoracique','pending',NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(2,4,2,'2026-04-23 10:30:00','video','Contrôle diabète','accepted',5,'2026-10-14 17:01:57','2026-10-14 17:19:01'),(4,5,3,'2026-12-12 12:00:00','voice','Consultation dentiste','pending',NULL,'2026-10-14 17:46:15','2026-10-14 17:46:15');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `specialty` varchar(255) NOT NULL DEFAULT 'Médecin Généraliste',
  `city` varchar(255) NOT NULL DEFAULT 'Non renseignée',
  `stars` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` int(10) unsigned NOT NULL DEFAULT 0,
  `bio` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_doctors_user` (`user_id`),
  CONSTRAINT `fk_doctors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,1,'Cardiologue','Casablanca',4.80,120,'Spécialiste cardiaque',NULL,NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(2,3,'Médecin Généraliste','Rabat',4.70,98,'Consultations générales et suivi médical',NULL,NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(3,6,'dentiste','BOULEMANE',0.00,0,'bbbbbbbbbbbbbbbbbbbb',NULL,NULL,'2026-10-14 17:15:53','2026-10-14 17:15:53');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medical_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint(20) unsigned DEFAULT NULL,
  `patient_id` bigint(20) unsigned NOT NULL,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `age` int(10) unsigned DEFAULT NULL,
  `taille` decimal(5,2) DEFAULT NULL,
  `poids` decimal(5,2) DEFAULT NULL,
  `gender` enum('Homme','Femme') NOT NULL DEFAULT 'Homme',
  `phone` varchar(20) DEFAULT NULL,
  `history` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `treatment` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_records_appointment` (`appointment_id`),
  KEY `idx_medical_records_patient_created` (`patient_id`,`created_at`),
  KEY `idx_medical_records_doctor_created` (`doctor_id`,`created_at`),
  CONSTRAINT `fk_records_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_records_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_records_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (1,1,2,1,45,175.00,78.50,'Homme','+330600000003','Antécédents familiaux cardiaques','Aucune allergie connue','Suspicion angine de poitrine','ECG + bilan sanguin + traitement initial',340.00,'2026-10-14 17:01:57','2026-10-14 17:01:57');
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT (current_timestamp() + interval 1 hour),
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_email` (`email`),
  KEY `idx_password_resets_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_profiles`
--

DROP TABLE IF EXISTS `patient_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `birth_date` date DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_patient_profiles_user` (`user_id`),
  CONSTRAINT `fk_patient_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_profiles`
--

LOCK TABLES `patient_profiles` WRITE;
/*!40000 ALTER TABLE `patient_profiles` DISABLE KEYS */;
INSERT INTO `patient_profiles` VALUES (1,2,'1990-01-15','Casablanca, Maroc','+330611111111','2026-10-14 17:01:57','2026-10-14 17:01:57'),(2,4,'1993-06-20','Rabat, Maroc','+330622222222','2026-10-14 17:01:57','2026-10-14 17:01:57'),(3,5,NULL,NULL,NULL,'2026-10-14 17:14:12','2026-10-14 17:14:12'),(4,6,NULL,'Ait lahcen el mers boulemane',NULL,'2026-10-14 17:15:53','2026-10-14 17:15:53');
/*!40000 ALTER TABLE `patient_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` enum('male','female','private') NOT NULL DEFAULT 'private',
  `role` enum('patient','doctor','admin') NOT NULL DEFAULT 'patient',
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Dr Karim Alaoui','Karim','Alaoui','doctor@healthplus.test',NULL,'0612345678','male','doctor','$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC',NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(2,'Ahmed Benali','Ahmed','Benali','patient@healthplus.test',NULL,'0623456789','male','patient','$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC',NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(3,'Dr Salma Idrissi','Salma','Idrissi','salma.idrissi@healthplus.com',NULL,'0634567890','female','doctor','$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC',NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(4,'Sara El Idrissi','Sara','El Idrissi','sara.idrissi@mail.com',NULL,'0645678901','female','patient','$2y$12$AjAXd4VYy8KxY0d5w7Mh2eb2jPA8FsqQhE6fSM4Q5h3I5t6WQX8wC',NULL,'2026-10-14 17:01:57','2026-10-14 17:01:57'),(5,'Karim Bettane','Karim','Bettane','karimbettane94@gmail.com',NULL,'0687238961','male','patient','$2y$12$USiEvCEZfEwtih08/K4DCO8er2XS6t.qzokME0m8Y8nho/hwpGiBu',NULL,'2026-10-14 17:14:12','2026-10-14 17:14:12'),(6,'ana Betta','ana','Betta','karimbettane5@gmail.com',NULL,'0687238961','male','doctor','$2y$12$QsXU1lceftY08xOrNf/vpOOo2dHBtcncVuym3gdIr5oO3Uy2a/1.S',NULL,'2026-10-14 17:15:53','2026-10-14 17:15:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'health_plus'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-14 17:48:23
