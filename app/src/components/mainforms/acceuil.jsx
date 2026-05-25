import React, { useState } from 'react';
import { useSession } from '../utils/session-service';
import CreateAccountPopup from '../popups/Popups';
import LoginPopup from '../popups/LoginPopup';
import Footer from '../layout/Footer';
import './acceuil.css';

import { API_BASE } from '../../api';

const Acceuil = () => {
  const { sessionStart, controleur, isAuthenticated } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleCreateAccount = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const handleSubmitPopup = (form) => {
    // Send registration data to backend API (correct endpoint and field names)
    return fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.nom,
        password: form.motdepasse,
        laboname: form.labo
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Erreur lors de la création du compte.');
        }
        setShowPopup(false);
        alert('Compte créé avec succès !');
      })
      .catch((err) => {
        // Re-throw so the popup can handle the error display
        throw err;
      });
  };

  const handleOpenLogin = () => setShowLoginPopup(true);
  const handleCloseLogin = () => setShowLoginPopup(false);
  const handleSubmitLogin = async (form) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.nom, password: form.motdepasse })
      });
      const rawText = await res.clone().text();
      console.log('RAW backend response:', rawText);
      if (!res.ok) {
        let data = {};
        try { data = JSON.parse(rawText); } catch { }
        throw new Error(data.error || 'Erreur de connexion.');
      }
      const responseData = JSON.parse(rawText);
      console.log('Login response from backend:', responseData);

      const { user, token } = responseData;
      sessionStart(user, token); // Pass both user object and token
      setShowLoginPopup(false);
    } catch (err) {
      // Re-throw so the LoginPopup can handle the error display
      throw err;
    }
  };

  return (
    <>
      <div className="acceuil-container">
        {/* Background decorations */}
        <div className="acceuil-bg-decoration acceuil-bg-decoration-1"></div>
        <div className="acceuil-bg-decoration acceuil-bg-decoration-2"></div>
        <div className="acceuil-bg-decoration acceuil-bg-decoration-3"></div>

        <div className="acceuil-content">
          <div className="acceuil-logo-section">
            <div className="acceuil-logo-wrapper">
              <img
                src={process.env.PUBLIC_URL + '/TT2.png'}
                alt="Tunisie Transformateur Logo"
                className="acceuil-logo"
              />
            </div>
          </div>

          <div className="acceuil-form-section">
            <div className="acceuil-welcome-text">
              <h1 className="acceuil-title">
                Bienvenue Chez<br />
                <span className="acceuil-title-highlight">Tunisie Transformateurs</span>
              </h1>
              {isAuthenticated && (
                <div className="acceuil-user-greeting">
                  👋 Bonjour, <strong>{controleur?.username}</strong> !
                </div>
              )}
              {!isAuthenticated && (
                <p className="acceuil-subtitle">
                  Plateforme de Gestion Interne
                </p>
              )}
            </div>

            {!isAuthenticated && (
              <div className="acceuil-auth-container">
                <div className="acceuil-section-title">Accès Employés</div>

                <div className="acceuil-buttons-container">
                  <button className="acceuil-btn acceuil-btn-primary" onClick={handleOpenLogin}>
                    <span className="acceuil-btn-icon">🔐</span>
                    Connexion
                  </button>

                  <div className="acceuil-divider">
                    <span>Nouveau collaborateur ?</span>
                  </div>

                  <button className="acceuil-btn acceuil-btn-secondary" onClick={handleCreateAccount}>
                    <span className="acceuil-btn-icon">✨</span>
                    Créer un compte
                  </button>
                </div>

                <div className="acceuil-terms">
                  Réservé aux employés de Tunisie Transformateurs.
                  <br />
                  Utilisation confidentielle et sécurisée.
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="acceuil-features">
                <div className="acceuil-feature-card">
                  <div className="acceuil-feature-icon">📁</div>
                  <div className="acceuil-feature-title">Ordres de Fabrication</div>
                  <div className="acceuil-feature-desc">Créez et gérez les commandes clients</div>
                </div>
                <div className="acceuil-feature-card">
                  <div className="acceuil-feature-icon">🏭</div>
                  <div className="acceuil-feature-title">Suivi Production</div>
                  <div className="acceuil-feature-desc">Surveillez la chaîne de production</div>
                </div>
                <div className="acceuil-feature-card">
                  <div className="acceuil-feature-icon">✅</div>
                  <div className="acceuil-feature-title">Test et Contrôle Qualité</div>
                  <div className="acceuil-feature-desc">Validez les étapes de fabrication</div>
                </div>
                <div className="acceuil-feature-card">
                  <div className="acceuil-feature-icon">📊</div>
                  <div className="acceuil-feature-title">Rapports & Analytique</div>
                  <div className="acceuil-feature-desc">Consultez les statistiques en temps réel</div>
                </div>
              </div>
            )}

            {/* Support Contact Section */}
            <div className="acceuil-support">
              <div className="acceuil-support-icon">💬</div>
              <div className="acceuil-support-content">
                <div className="acceuil-support-title">Support Technique Interne</div>
                <div className="acceuil-support-text">
                  Pour toute assistance, contactez le service IT
                </div>
                <div className="acceuil-support-text">
                  📧 <a href="mailto:DEV@TTRANSFO.COM" className="acceuil-support-email">
                    DEV@TTRANSFO.COM
                  </a>
                </div>
                <div className="acceuil-support-text">
                  📧 <a href="mailto:bassemdridi1234@gmail.com" className="acceuil-support-email">
                    bassemdridi1234@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <CreateAccountPopup isOpen={showPopup} onClose={handleClosePopup} onSubmit={handleSubmitPopup} />
      <LoginPopup isOpen={showLoginPopup} onClose={handleCloseLogin} onSubmit={handleSubmitLogin} />
    </>
  );
};

export default Acceuil;