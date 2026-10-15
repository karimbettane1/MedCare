import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/LegalDocs.css";

function LegalDocs() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="legal-page">
      <section className="legal-hero">
        <h1 className="legal-siteTitle">
          <Link to="/">
            MedCare
          </Link>
        </h1>
        <p className="legal-hero-subtitle">
          Mentions légales, conditions d’utilisation et politique de confidentialité
        </p>
      </section>

      <main className="legal-card">
        <div className="legal-text-content">
          <article className="legal-block">
            <h2 className="legal-title">Informations générales</h2>
            <p className="legal-description">
              Bienvenue sur MedCare, votre plateforme de santé en ligne de confiance.
              Notre mission est de rendre les services médicaux plus accessibles,
              simples et personnalisés. En utilisant notre plateforme, vous acceptez
              les conditions décrites dans cette page, notamment notre politique de
              confidentialité et nos conditions d’utilisation.
            </p>
          </article>

          <article className="legal-block">
            <h2 className="legal-title">Politique de confidentialité</h2>
            <p className="legal-description">
              La protection de vos données est une priorité absolue. Nous collectons
              uniquement les informations nécessaires à votre prise en charge
              (identité, contact, données médicales utiles) et nous appliquons des
              mesures de sécurité strictes pour garantir leur confidentialité.
              Aucune donnée personnelle n’est partagée sans base légale ou consentement.
            </p>
          </article>

          <article className="legal-block">
            <h2 className="legal-title">Conditions d’utilisation</h2>
            <p className="legal-description">
              En accédant à MedCare, vous vous engagez à fournir des informations
              exactes et à utiliser la plateforme de manière responsable. Les
              utilisateurs (patients et médecins) doivent respecter les règles de
              bonne conduite, de confidentialité et de respect mutuel. Toute
              utilisation abusive peut entraîner une suspension de compte.
            </p>
          </article>

          <article className="legal-block">
            <h2 className="legal-title">Consultations en ligne</h2>
            <p className="legal-description">
              Nos consultations à distance facilitent l’accès à des professionnels
              qualifiés. Elles ne remplacent pas systématiquement un examen médical
              en présentiel. En cas d’urgence médicale, contactez immédiatement les
              services de secours ou rendez-vous à l’établissement de santé le plus proche.
            </p>
          </article>

          <article className="legal-block">
            <h2 className="legal-title">Fonctionnement de la plateforme</h2>
            <p className="legal-description">
              MedCare vous permet de rechercher un spécialiste, prendre rendez-vous
              et échanger dans un cadre sécurisé. Les recommandations fournies
              dépendent des informations communiquées. Pour une qualité de service
              optimale, veillez à renseigner des données complètes et à jour.
            </p>
          </article>
        </div>

        <footer className="legal-footer">
          <p>© 2026 MedCare. Tous droits réservés.</p>
        </footer>
      </main>
    </div>
  );
}

export default LegalDocs;
