import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "../Styles/Navbar.css";
import { Link } from "react-router-dom";
function Navbar({ onOpenChat }) {
  const [nav, setNav] = useState(false);
  const openNav = () => {
    setNav(!nav);
  };

  const handleChatBtnClick = () => {
    if (typeof onOpenChat === "function") {
      onOpenChat();
    }
  };

  return (
    <div className="navbar-section">
      <h1 className="navbar-title">
        <Link to="/">MedCare</Link>
      </h1>

      {/* Desktop */}
      <ul className="navbar-items">
        <li>
          <Link to="/" className="navbar-links">
            Accueil
          </Link>
        </li>
        <li>
            <a href="#services" className="navbar-links">
            Services
          </a>
        </li>
        <li>
            <a href="#about" className="navbar-links">
            À propos
          </a>
        </li>
        <li>
            <a href="#reviews" className="navbar-links">
            Avis
          </a>
        </li>
        <li>
        <a href="#doctors" className="navbar-links">
            Médecins
          </a>
        </li>
        <li>
          <Link to="/inscription" className="navbar-links">
            Inscription
          </Link>
        </li>
      </ul>

      <button
        className="navbar-btn"
        type="button"
        onClick={handleChatBtnClick}
      >
        <FontAwesomeIcon icon={faCommentDots} /> Chat en direct
      </button>

      {/* Mobile */}
      <div className={`mobile-navbar ${nav ? "open-nav" : ""}`} aria-hidden={!nav}>
        <button
          type="button"
          onClick={openNav}
          className="mobile-navbar-close"
          aria-label="Fermer le menu"
        >
          <FontAwesomeIcon icon={faXmark} className="hamb-icon" />
        </button>

        <ul className="mobile-navbar-links">
          <li>
            <Link onClick={openNav} to="/">
              Accueil
            </Link>
          </li>
          <li>
            <a onClick={openNav} href="#services">
              Services
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#about">
              À propos
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#reviews">
              Avis
            </a>
          </li>
          <li>
            <a onClick={openNav} href="#doctors">
              Médecins
            </a>
          </li>
          <li>
            <Link onClick={openNav} to="/chat">
              Chat en direct
            </Link>
          </li>
        </ul>
      </div>

      {/* Hamburger Icon */}
      <button
        type="button"
        className="mobile-nav"
        onClick={openNav}
        aria-label="Ouvrir le menu"
        aria-expanded={nav}
      >
        <FontAwesomeIcon icon={faBars} className="hamb-icon" />
      </button>

    </div>
  );
}

export default Navbar;
