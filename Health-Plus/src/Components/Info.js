import React from "react";
import InformationCard from "./InformationCard";
import { faHeartPulse, faTruckMedical, faTooth } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Info.css";

function Info() {
  return (
    <div className="info-section" id="services">
      <div className="info-title-content">
        <h3 className="info-title">
          <span>Ce que nous faisons</span>
        </h3>
        <p className="info-description">
          Nous apportons les soins de santé à votre convenance, en offrant une gamme complète
          de services médicaux à la demande adaptés à vos besoins. Notre
          plateforme vous permet de vous connecter avec des médecins en ligne expérimentés qui
          fournissent des conseils médicaux experts, délivre des ordonnances en ligne et offre
          des renouvellements rapides quand vous en avez besoin.
        </p>
      </div>

      <div className="info-cards-content">
        <InformationCard
          title="Soins d'urgence"
          description="Notre service de soins d'urgence est conçu pour être votre soutien fiable
            dans les situations critiques. Que ce soit une maladie soudaine, une blessure ou
            toute préoccupation médicale nécessitant une attention immédiate, notre équipe de
            professionnels de la santé dédiés est disponible 24/7 pour fournir
            des soins rapides et efficaces."
          icon={faTruckMedical}
        />

        <InformationCard
          title="Maladies cardiaques"
          description="Notre équipe de cardiologues expérimentés et d'experts médicaux utilise
            une technologie de pointe pour évaluer votre santé cardiovasculaire et
            concevoir des plans de traitement personnalisés. Des dépistages complets
            aux interventions avancées, nous nous engageons à vous aider à maintenir
            un cœur en bonne santé et à mener une vie épanouie."
          icon={faHeartPulse}
        />

        <InformationCard
          title="Soins dentaires"
          description="Souriez en toute confiance avec nos services de soins dentaires qui répondent à tous vos
            besoins de santé buccale. Nos dentistes qualifiés offrent une large gamme de
            traitements, des contrôles de routine et nettoyages aux procédures cosmétiques
            et traitements restaurateurs."
          icon={faTooth}
        />
      </div>
    </div>
  );
}

export default Info;
