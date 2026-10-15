# TODO - Travaux en cours

## Backend - Dossier médical (taille/poids)
- [x] Créer une migration pour ajouter `taille` et `poids` à `medical_records`
- [x] Mettre à jour le modèle `MedicalRecord` (`$fillable` + `$casts`)
- [x] Mettre à jour `MedicalRecordController` (index/store/update)
- [x] Mettre à jour SQL (`Health-Plus/sql.sql`)
- [x] Refresh migration + seeders (avec correction seeder appointments)

## Frontend - Améliorer la page Prendre un rendez-vous médical
- [x] Nettoyer le composant `AppointmentForm` (états inutilisés, messages FR)
- [x] Ajouter état de soumission (`isSubmitting`) et bouton désactivé pendant envoi
- [x] Renforcer la validation téléphone
- [x] Ajouter un bloc “Informations avant confirmation”
- [x] Mettre à jour le style `AppointmentForm.css` pour les nouveaux éléments

## Frontend - UI/CSS page `/appointment`
- [x] Enrichir le hero (badge + indicateurs visuels)
- [x] Améliorer la lisibilité du bloc filtres
- [x] Renforcer la hiérarchie visuelle de la section liste
- [x] Ajuster le responsive mobile de la page

## Frontend - Doctor Card
- [x] Améliorer structure visuelle de `DoctorCard.js`
- [x] Moderniser style de `Doctors.css`
- [x] Ajuster responsive des cartes médecins

## Frontend - Alert style (SweetAlert2)
- [x] Ajouter styles globaux d'alerte dans `App.css`
- [x] Harmoniser classes custom dans `AppointmentPage.js`
- [x] Vérifier cohérence visuelle des alertes (module partagé `src/Scripts/appAlert.js`, utilisé partout)

## Frontend - Source des docteurs (API only)
- [x] Retirer fallback `localDoctors` de `AppointmentPage.js`
- [x] Afficher uniquement les docteurs provenant de la base de données

## Frontend - Affichage image docteur dans la card
- [x] Mettre à jour la priorité des champs image dans `AppointmentPage.js` (`photo_url`, `img`, `photo_path`)
- [x] Corriger la normalisation des chemins image dans `DoctorCard.js` (cas `storage/...`, `photo/...`, chemins relatifs)
- [x] Vérifier les noms de fichiers réellement présents dans `Health-Plus/public/photo`
- [x] Aligner `photo_path` seeders avec les fichiers image réellement disponibles
- [x] Reseed base de données pour appliquer les nouveaux `photo_path`
- [x] Servir `storage/app/public` sans lien symbolique (disque Ventoy non-NTFS) : route `/storage/{path}` dans `routes/web.php`
- [x] Corriger le 403 : `filesystems.php` → disque `local` `serve=false` (visibilité privée) pour ne plus écraser la route `/storage`

## Rendez-vous - Gestion des créneaux horaires (08:30-16:00 / 30 min)
- [x] Backend: endpoint `GET /appointments/availability?doctor_id&date` (créneaux générés, réservés/passés exclus)
- [x] Backend: `store()` durci (validation format créneau, plage, futur + transaction + `lockForUpdate` anti double-réservation)
- [x] Backend: statuts bloquants `pending`/`accepted` ; `rejected`/`cancelled` libèrent le créneau
- [x] Backend: timezone app `Etc/GMT-1` (Maroc UTC+1) pour un filtrage correct des créneaux passés
- [x] Frontend: `AppointmentForm` remplace datetime-local par date + boutons créneaux (chargement, vide, sélection)
- [x] Frontend: messages SweetAlert2 (succès / créneau réservé / erreur) + refresh auto après réservation
- [x] Tests: happy path, doublon séquentiel (409), concurrence parallèle (1 seul 201), créneaux invalides (422), date passée (422)
- [x] Vérifié dans le navigateur + build React "Compiled successfully"

