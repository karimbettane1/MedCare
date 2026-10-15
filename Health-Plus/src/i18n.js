import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      common: {
        language: "Langue",
        french: "Français",
        english: "English",
        arabic: "العربية",
      },
      nav: {
        home: "Accueil",
        legal: "Mentions légales",
        appointment: "Rendez-vous",
        login: "Connexion",
        register: "Inscription",
      },
      home: {
        title: "Votre santé, notre priorité",
        subtitle: "Prenez rendez-vous rapidement avec des médecins qualifiés.",
      },
      login: {
        title: "Connexion",
      },
      doctorDashboard: {
        title: "Dashboard Médecin",
      },
      patientDashboard: {
        title: "Tableau de Bord Patient",
      },
    },
  },
  en: {
    translation: {
      common: {
        language: "Language",
        french: "Français",
        english: "English",
        arabic: "العربية",
      },
      nav: {
        home: "Home",
        legal: "Legal",
        appointment: "Appointment",
        login: "Login",
        register: "Register",
      },
      home: {
        title: "Your health, our priority",
        subtitle: "Book appointments quickly with qualified doctors.",
      },
      login: {
        title: "Login",
      },
      doctorDashboard: {
        title: "Doctor Dashboard",
      },
      patientDashboard: {
        title: "Patient Dashboard",
      },
    },
  },
  ar: {
    translation: {
      common: {
        language: "اللغة",
        french: "Français",
        english: "English",
        arabic: "العربية",
      },
      nav: {
        home: "الرئيسية",
        legal: "الشروط القانونية",
        appointment: "المواعيد",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
      },
      home: {
        title: "صحتك أولويتنا",
        subtitle: "احجز مواعيدك بسرعة مع أطباء مؤهلين.",
      },
      login: {
        title: "تسجيل الدخول",
      },
      doctorDashboard: {
        title: "لوحة تحكم الطبيب",
      },
      patientDashboard: {
        title: "لوحة تحكم المريض",
      },
    },
  },
};

const savedLanguage = localStorage.getItem("appLanguage") || "fr";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = i18n.language;
document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("appLanguage", lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
});

export default i18n;
