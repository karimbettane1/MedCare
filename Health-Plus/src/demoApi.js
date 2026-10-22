// GitHub Pages ne peut pas exécuter le backend Laravel : quand REACT_APP_API_URL
// est absente, cette couche réplique l'API dans le navigateur via localStorage.
import photoKarim from "./Assets/téléchargement (2).jfif";
import photoSalma from "./Assets/téléchargement (3).jfif";
import photoYoussef from "./Assets/Child specialist here 🙂.jfif";
import photoLina from "./Assets/téléchargement (4).jfif";
import photo1 from "./Assets/profile-1.png";
import photo2 from "./Assets/profile-2.png";
import photo3 from "./Assets/profile-3.png";
import photo4 from "./Assets/profile-4.png";

const DB_KEY = "medcare_demo_db_v1";

const SLOT_START_MINUTES = 8 * 60 + 30;
const SLOT_END_MINUTES = 16 * 60;
const SLOT_DURATION_MINUTES = 30;
const BLOCKING_STATUSES = ["pending", "accepted"];

let dbCache = null;

function formatDateTime(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${mo}/${y} ${h}:${mi}`;
}

function generateSlots() {
  const slots = [];
  for (let m = SLOT_START_MINUTES; m + SLOT_DURATION_MINUTES <= SLOT_END_MINUTES; m += SLOT_DURATION_MINUTES) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}

function parseDateTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value || ""));
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0));
}

function seedDb() {
  const nowIso = new Date().toISOString();
  return {
    seq: { user: 100, doctor: 100, appointment: 100, record: 100 },
    passwordResets: [],
    users: [
      { id: 1, name: "Test User", email: "test@example.com", phone: "0611111111", gender: "male", role: "patient", password: "password123", token: null, created_at: nowIso },
      { id: 2, name: "Dr Karim Alaoui", email: "doctor@healthplus.test", phone: "0612345678", gender: "male", role: "doctor", password: "password123", doctor_id: 1, token: null, created_at: nowIso },
      { id: 3, name: "Ahmed Benali", email: "patient@healthplus.test", phone: "0623456789", gender: "male", role: "patient", password: "password123", token: null, created_at: nowIso },
    ],
    doctors: [
      { id: 1, user_id: 2, name: "Dr Karim Alaoui", email: "doctor@healthplus.test", specialty: "cardiologue", city: "casablanca", stars: 4.8, reviews: 120, bio: "Spécialiste cardiaque", photo_url: photoKarim },
      { id: 2, user_id: null, name: "Dr Salma Idrissi", email: "salma.idrissi@healthplus.test", specialty: "dermatologue", city: "rabat", stars: 4.7, reviews: 98, bio: "Spécialiste en dermatologie clinique.", photo_url: photoSalma },
      { id: 3, user_id: null, name: "Dr Youssef Bennani", email: "youssef.bennani@healthplus.test", specialty: "pédiatre", city: "marrakech", stars: 4.9, reviews: 143, bio: "Pédiatre avec 12 ans d'expérience.", photo_url: photoYoussef },
      { id: 4, user_id: null, name: "Dr Lina El Fassi", email: "lina.elfassi@healthplus.test", specialty: "neurologue", city: "tangier", stars: 4.6, reviews: 76, bio: "Spécialiste des troubles neurologiques.", photo_url: photoLina },
      { id: 5, user_id: null, name: "Dr Omar Tazi", email: "omar.tazi@healthplus.test", specialty: "généraliste", city: "agadir", stars: 4.5, reviews: 61, bio: "Médecin généraliste, premiers soins et suivi continu.", photo_url: photo1 },
      { id: 6, user_id: null, name: "Dr Nisrine Berrada", email: "nisrine.berrada@healthplus.test", specialty: "gynécologue", city: "fes", stars: 4.8, reviews: 112, bio: "Gynécologie-obstétrique et suivi prénatal.", photo_url: photo2 },
      { id: 7, user_id: null, name: "Dr Hicham Moussaoui", email: "hicham.moussaoui@healthplus.test", specialty: "ophtalmologue", city: "laayoune", stars: 4.7, reviews: 84, bio: "Ophtalmologie médicale et chirurgicale.", photo_url: photo3 },
      { id: 8, user_id: null, name: "Dr Imane Chraibi", email: "imane.chraibi@healthplus.test", specialty: "orthopédiste", city: "meknes", stars: 4.9, reviews: 157, bio: "Chirurgie orthopédique et traumatologie du sport.", photo_url: photo4 },
    ],
    appointments: [
      {
        id: 1,
        patient_id: 3,
        patient_name: "Ahmed Benali",
        doctor_id: 1,
        doctor_name: "Dr Karim Alaoui",
        appointment_datetime: "2026-04-23 09:00:00",
        reason: "Douleur thoracique",
        preferred_mode: "voice",
        status: "pending",
        rating: null,
      },
      {
        id: 2,
        patient_id: 3,
        patient_name: "Ahmed Benali",
        doctor_id: 2,
        doctor_name: "Dr Salma Idrissi",
        appointment_datetime: "2026-09-14 10:30:00",
        reason: "Consultation dermatologue",
        preferred_mode: "video",
        status: "completed",
        rating: 5,
      },
    ],
    records: [
      {
        id: 1,
        appointment_id: 1,
        patient_id: 3,
        patient_name: "Ahmed Benali",
        doctor_id: 1,
        doctor_name: "Dr Karim Alaoui",
        age: 45,
        taille: 175,
        poids: 78.5,
        gender: "Homme",
        phone: "+330600000003",
        history: "Antécédents familiaux cardiaques",
        allergies: "Aucune allergie connue",
        diagnosis: "Suspicion angine de poitrine",
        treatment: "ECG + bilan sanguin + traitement initial",
        price: 340,
        created_at: "23/04/2026 09:30",
        _ts: new Date(2026, 3, 23, 9, 30).getTime(),
      },
    ],
  };
}

function loadDb() {
  if (dbCache) return dbCache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      dbCache = JSON.parse(raw);
      return dbCache;
    }
  } catch (e) {
    // Stockage indisponible ou données corrompues : on repart d'une base neuve.
  }
  dbCache = seedDb();
  saveDb();
  return dbCache;
}

function saveDb() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(dbCache));
  } catch (e) {
    // Quota dépassé : les données restent en mémoire pour la session.
  }
}

function currentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return loadDb().users.find((u) => u.token === token) || null;
}

function publicUser(user) {
  const data = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    role: user.role,
    created_at: user.created_at,
  };
  if (user.role === "doctor") data.doctor_id = user.doctor_id;
  return data;
}

function refreshDoctorStats(db, doctorId) {
  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor) return null;
  const rated = db.appointments.filter((a) => a.doctor_id === doctorId && a.rating != null);
  doctor.reviews = rated.length;
  doctor.stars = rated.length
    ? Math.round((rated.reduce((sum, a) => sum + a.rating, 0) / rated.length) * 10) / 10
    : 0;
  return doctor;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 150));

export function createDemoApi() {
  console.info(
    "[MedCare] Mode démo actif : les données sont stockées dans ce navigateur. " +
      "Définis REACT_APP_API_URL pour brancher l'API Laravel."
  );

  return {
    async register(body) {
      await wait();
      const fields = typeof FormData !== "undefined" && body instanceof FormData
        ? Object.fromEntries(body.entries())
        : body;
      const db = loadDb();
      const email = String(fields.email || "").trim().toLowerCase();
      if (!String(fields.name || "").trim()) throw new Error("Le nom est requis.");
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("L'adresse email est invalide.");
      if (String(fields.password || "").length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
      const role = fields.role || "patient";
      if (!["patient", "doctor"].includes(role)) throw new Error("Le rôle sélectionné est invalide.");
      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error("Cette adresse email est déjà utilisée.");
      }

      const user = {
        id: ++db.seq.user,
        name: String(fields.name).trim(),
        email,
        phone: fields.phone || "",
        gender: fields.gender || "private",
        role,
        password: fields.password,
        token: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        created_at: new Date().toISOString(),
      };

      if (role === "doctor") {
        const doctor = {
          id: ++db.seq.doctor,
          user_id: user.id,
          name: user.name,
          email: user.email,
          specialty: String(fields.specialty || "généraliste").trim().toLowerCase(),
          city: String(fields.city || "casablanca").trim().toLowerCase(),
          stars: 0,
          reviews: 0,
          bio: fields.bio || "",
          photo_url: null,
        };
        db.doctors.push(doctor);
        user.doctor_id = doctor.id;
      }

      db.users.push(user);
      saveDb();
      return { message: "Inscription réussie.", data: { ...publicUser(user), token: user.token } };
    },

    async login({ email, password }) {
      await wait();
      const db = loadDb();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === String(email || "").trim().toLowerCase()
      );
      if (!user || user.password !== password) {
        throw new Error("Email ou mot de passe incorrect.");
      }
      user.token = `demo-${user.id}-${Math.random().toString(36).slice(2, 12)}`;
      saveDb();
      return { message: "Connexion réussie.", data: { ...publicUser(user), token: user.token } };
    },

    async logout() {
      await wait();
      const user = currentUser();
      if (user) {
        user.token = null;
        saveDb();
      }
      return { message: "Déconnexion réussie." };
    },

    async forgotPassword({ email }) {
      await wait();
      const db = loadDb();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === String(email || "").trim().toLowerCase()
      );
      if (user) {
        db.passwordResets = db.passwordResets.filter((r) => r.email !== user.email);
        db.passwordResets.push({
          email: user.email,
          token: Math.random().toString(36).slice(2),
          used: false,
        });
        saveDb();
      }
      return {
        message: "Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.",
      };
    },

    async resetPassword({ email, token, password }) {
      await wait();
      const db = loadDb();
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const reset = db.passwordResets.find(
        (r) => r.email.toLowerCase() === normalizedEmail && r.token === token && !r.used
      );
      if (!reset) throw new Error("Lien de réinitialisation invalide ou expiré.");
      const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (user) user.password = password;
      reset.used = true;
      saveDb();
      return { message: "Mot de passe réinitialisé avec succès." };
    },

    async getDoctors() {
      await wait();
      const { doctors } = loadDb();
      return { data: doctors.map((d) => ({ ...d })) };
    },

    async getAvailability(doctorId, date) {
      await wait();
      const db = loadDb();
      const doctor = db.doctors.find((d) => d.id === Number(doctorId));
      if (!doctor) throw new Error("Le médecin sélectionné est invalide.");
      const dayStart = parseDateTime(`${date} 00:00:00`);
      if (!dayStart) throw new Error("La date sélectionnée est invalide.");
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dayStart < todayStart) throw new Error("La date sélectionnée est dans le passé.");

      const prefix = `${date} `;
      const blockedTimes = db.appointments
        .filter(
          (a) =>
            a.doctor_id === doctor.id &&
            a.appointment_datetime.startsWith(prefix) &&
            BLOCKING_STATUSES.includes(a.status)
        )
        .map((a) => a.appointment_datetime.slice(11, 16));

      const isToday = dayStart.getTime() === todayStart.getTime();
      const slots = generateSlots().filter((slot) => {
        if (blockedTimes.includes(slot)) return false;
        if (isToday) {
          const slotDate = parseDateTime(`${date} ${slot}:00`);
          if (slotDate && slotDate <= now) return false;
        }
        return true;
      });

      return { data: { date, slots } };
    },

    async createAppointment({ doctor_id, appointment_datetime, reason, preferred_mode }) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      if (!user || user.role !== "patient") {
        throw new Error("Seuls les patients peuvent prendre un rendez-vous.");
      }
      const doctor = db.doctors.find((d) => d.id === Number(doctor_id));
      if (!doctor) throw new Error("Le médecin sélectionné est invalide.");
      const slotDate = parseDateTime(appointment_datetime);
      if (!slotDate) throw new Error("La date du rendez-vous est invalide.");
      const slotTime = appointment_datetime.slice(11, 16);
      if (!generateSlots().includes(slotTime)) {
        throw new Error("Le créneau doit durer 30 minutes et se situer entre 08:30 et 16:00.");
      }
      if (slotDate <= new Date()) {
        throw new Error("Veuillez sélectionner un créneau futur.");
      }
      const conflict = db.appointments.some(
        (a) =>
          a.doctor_id === doctor.id &&
          a.appointment_datetime === appointment_datetime &&
          BLOCKING_STATUSES.includes(a.status)
      );
      if (conflict) {
        throw new Error("Cette heure vient d'être réservée. Veuillez choisir une autre heure.");
      }

      const appointment = {
        id: ++db.seq.appointment,
        patient_id: user.id,
        patient_name: user.name,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        appointment_datetime,
        reason: reason || "",
        preferred_mode,
        status: "pending",
        rating: null,
      };
      db.appointments.push(appointment);
      saveDb();
      return {
        message: "Votre rendez-vous a été enregistré avec succès.",
        data: { ...appointment },
      };
    },

    async getAppointments(params = {}) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      if (!user) throw new Error("Unauthenticated.");
      let items =
        user.role === "doctor"
          ? db.appointments.filter((a) => a.doctor_id === user.doctor_id)
          : db.appointments.filter((a) => a.patient_id === user.id);
      if (params.status && params.status !== "all") {
        items = items.filter((a) => a.status === params.status);
      }
      items = [...items].sort((a, b) => b.appointment_datetime.localeCompare(a.appointment_datetime));
      return { data: items.map((a) => ({ ...a })) };
    },

    async updateAppointmentStatus(appointmentId, status) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      const appointment = db.appointments.find((a) => a.id === Number(appointmentId));
      if (!appointment) throw new Error("Rendez-vous introuvable.");
      const isAssignedDoctor = Boolean(user) && user.role === "doctor" && user.doctor_id === appointment.doctor_id;
      const isConcernedPatient = Boolean(user) && user.id === appointment.patient_id;
      if (!isAssignedDoctor && !(isConcernedPatient && status === "cancelled")) {
        throw new Error("Vous ne pouvez pas modifier ce rendez-vous.");
      }
      appointment.status = status;
      saveDb();
      return { message: "Statut du rendez-vous mis à jour.", data: { ...appointment } };
    },

    async submitDoctorRating(appointmentId, patientId, rating) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      const appointment = db.appointments.find((a) => a.id === Number(appointmentId));
      if (!appointment || !user || appointment.patient_id !== user.id) {
        throw new Error("Vous ne pouvez pas noter ce rendez-vous.");
      }
      if (appointment.status !== "completed") {
        throw new Error("Seuls les rendez-vous terminés peuvent être notés.");
      }
      if (appointment.rating != null) {
        throw new Error("Ce rendez-vous a déjà été noté.");
      }
      appointment.rating = Number(rating);
      const doctor = refreshDoctorStats(db, appointment.doctor_id);
      saveDb();
      return {
        message: "Évaluation enregistrée avec succès.",
        data: {
          appointment_id: appointment.id,
          doctor_id: appointment.doctor_id,
          rating: appointment.rating,
          doctor_stars: doctor ? doctor.stars : null,
          doctor_reviews_count: doctor ? doctor.reviews : null,
        },
      };
    },

    async rateDoctor(doctorId, rating) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      if (!user || user.role !== "patient") {
        throw new Error("Seuls les patients peuvent évaluer un médecin.");
      }
      const doctor = db.doctors.find((d) => d.id === Number(doctorId));
      if (!doctor) throw new Error("Médecin introuvable.");
      const consultation = db.appointments
        .filter(
          (a) =>
            a.doctor_id === doctor.id &&
            a.patient_id === user.id &&
            ["accepted", "completed"].includes(a.status) &&
            a.rating == null
        )
        .sort((a, b) => b.appointment_datetime.localeCompare(a.appointment_datetime))[0];
      if (!consultation) {
        throw new Error(
          "Vous pouvez évaluer ce médecin qu'après une consultation, et une fois par consultation."
        );
      }
      consultation.rating = Number(rating);
      refreshDoctorStats(db, doctor.id);
      saveDb();
      return {
        message: "Évaluation du médecin enregistrée avec succès.",
        data: {
          doctor_id: doctor.id,
          rating: Number(rating),
          doctor_stars: doctor.stars,
          doctor_reviews_count: doctor.reviews,
        },
      };
    },

    async getMedicalRecords() {
      await wait();
      const db = loadDb();
      const user = currentUser();
      if (!user) throw new Error("Unauthenticated.");
      const items =
        user.role === "doctor"
          ? db.records.filter((r) => r.doctor_id === user.doctor_id)
          : db.records.filter((r) => r.patient_id === user.id);
      items.sort((a, b) => (b._ts || 0) - (a._ts || 0));
      return { data: items.map(({ _ts, ...record }) => record) };
    },

    async createMedicalRecord(payload) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      if (!user || user.role !== "doctor") {
        throw new Error("Seuls les médecins peuvent créer un dossier médical.");
      }
      const doctor = db.doctors.find((d) => d.id === user.doctor_id);
      const patient = db.users.find((u) => u.id === Number(payload.patient_id));
      const now = new Date();
      const record = {
        id: ++db.seq.record,
        appointment_id: payload.appointment_id || null,
        patient_id: patient ? patient.id : Number(payload.patient_id),
        patient_name: patient ? patient.name : "Patient",
        doctor_id: doctor ? doctor.id : user.doctor_id,
        doctor_name: doctor ? doctor.name : user.name,
        age: Number(payload.age) || null,
        taille: payload.taille != null ? Number(payload.taille) : null,
        poids: payload.poids != null ? Number(payload.poids) : null,
        gender: payload.gender || "Homme",
        phone: payload.phone || "",
        history: payload.history || "",
        allergies: payload.allergies || "",
        diagnosis: payload.diagnosis || "",
        treatment: payload.treatment || "",
        price: Number(payload.price) || 0,
        created_at: formatDateTime(now),
        _ts: now.getTime(),
      };
      db.records.push(record);
      saveDb();
      return { message: "Dossier médical créé avec succès.", data: { ...record } };
    },

    async updateMedicalRecord(recordId, payload) {
      await wait();
      const db = loadDb();
      const user = currentUser();
      const record = db.records.find((r) => r.id === Number(recordId));
      if (!record) throw new Error("Dossier médical introuvable.");
      if (!user || user.role !== "doctor" || record.doctor_id !== user.doctor_id) {
        throw new Error("Vous ne pouvez pas modifier ce dossier médical.");
      }
      Object.assign(record, {
        age: Number(payload.age) || null,
        taille: payload.taille != null ? Number(payload.taille) : null,
        poids: payload.poids != null ? Number(payload.poids) : null,
        gender: payload.gender || record.gender,
        phone: payload.phone || "",
        history: payload.history || "",
        allergies: payload.allergies || "",
        diagnosis: payload.diagnosis || "",
        treatment: payload.treatment || "",
        price: Number(payload.price) || 0,
      });
      saveDb();
      return { message: "Dossier médical mis à jour avec succès.", data: { ...record } };
    },

    async getProfile(userId) {
      await wait();
      const user = loadDb().users.find((u) => u.id === Number(userId));
      if (!user) throw new Error("Utilisateur introuvable.");
      return { data: publicUser(user) };
    },

    async updateProfile(userId, body) {
      await wait();
      const db = loadDb();
      const user = db.users.find((u) => u.id === Number(userId));
      if (!user) throw new Error("Utilisateur introuvable.");
      if (body.first_name || body.last_name) {
        user.name = `${body.first_name || ""} ${body.last_name || ""}`.trim();
      }
      if (body.email) user.email = body.email;
      if (body.phone !== undefined) user.phone = body.phone;
      saveDb();
      return { data: publicUser(user) };
    },

    async chat({ messages }) {
      await wait();
      const lastUserMessage = [...(messages || [])].reverse().find((m) => m.role === "user");
      const prompt = String(lastUserMessage?.content || "").trim();
      return {
        message: "Mode fallback activé (GROQ_API_KEY absente).",
        data: {
          reply: prompt
            ? `Assistant local: J'ai bien reçu votre message: "${prompt}". Le service IA externe n'est pas configuré pour le moment.`
            : "Assistant local: Le service IA externe n'est pas configuré pour le moment, mais le chat est actif.",
          raw_message: { role: "assistant", content: prompt },
          usage: null,
        },
      };
    },
  };
}
