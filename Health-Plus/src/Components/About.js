import React from "react";
import Doctor from "../Assets/doctor-group.png";
import SolutionStep from "./SolutionStep";
import "../Styles/About.css";

function About() {
  return (
    <div className="about-section" id="about">
      <div className="about-image-content">
        <img src={Doctor} alt="Groupe de médecins" className="about-image1" />
      </div>

      <div className="about-text-content">
        <h3 className="about-title">
          <span>À propos de nous</span>
        </h3>
        <p className="about-description">
          Bienvenue chez MedCare, votre partenaire de confiance pour des soins de santé accessibles et personnalisés.

          Nos médecins experts proposent des consultations en ligne et des services spécialisés, en mettant votre bien-être au cœur de leurs priorités.

          Rejoignez-nous dans cette démarche vers une meilleure santé.
        </p>

        <h4 className="about-text-title">Vos solutions</h4>

        <SolutionStep
          title="Choisissez un spécialiste"
          description="Trouvez le spécialiste idéal et prenez rendez-vous facilement chez MedCare.

Nos médecins experts accordent la priorité à votre santé et vous proposent des soins personnalisés adaptés à vos besoins."/>

        <SolutionStep
          title="Prenez Rendez-vous"
          description="Choisissez la date et l’heure qui vous conviennent le mieux, et laissez notre équipe dévouée de professionnels de santé veiller à votre bien-être grâce à des soins personnalisés."
        />

        <SolutionStep
          title="Obtenez vos solutions"
          description="Nos médecins expérimentés et spécialistes sont là pour fournir des conseils experts et des plans de traitement personnalisés, vous aidant à atteindre la meilleure santé possible."
        />
      </div>
    </div>
  );
}

export default About;
