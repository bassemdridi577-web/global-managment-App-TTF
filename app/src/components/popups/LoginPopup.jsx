import React, { useState } from 'react';
import './Popups.css';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';

const LoginPopup = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: '',
    motdepasse: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.motdepasse) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    // Independent checks for name
    if (form.nom.startsWith(' ') && form.nom.endsWith(' ')) {
      setError('Attention: Des espaces au début et à la fin du nom.');
      return;
    } else if (form.nom.startsWith(' ')) {
      setError('Attention: Un espace au début du nom.');
      return;
    } else if (form.nom.endsWith(' ')) {
      setError('Attention: Un espace à la fin du nom.');
      return;
    }

    // Independent checks for password
    if (form.motdepasse.startsWith(' ') && form.motdepasse.endsWith(' ')) {
      setError('Attention: Des espaces au début et à la fin du mot de passe.');
      return;
    } else if (form.motdepasse.startsWith(' ')) {
      setError('Attention: Un espace au début du mot de passe.');
      return;
    } else if (form.motdepasse.endsWith(' ')) {
      setError('Attention: Un espace à la fin du mot de passe.');
      return;
    }

    setError('');
    setIsLoading(true);
    
    // Ensure loading state is visible for at least 800ms for better UX
    Promise.all([
      // Execute onSubmit and catch any rejected errors to display them in the popup
      Promise.resolve(onSubmit(form)).catch(err => {
        setError(err.message || "Erreur de connexion.");
        throw err; // Re-throw to keep Promise.all aware of the failure if needed
      }),
      new Promise(resolve => setTimeout(resolve, 800))
    ]).catch(() => {
        // Error is already handled inside the first promise
    }).finally(() => {
      setIsLoading(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>&times;</button>
        <h2>Se connecter</h2>
        <form onSubmit={handleSubmit} className="popup-form">
          <label>Nom</label>
          <input name="nom" type="text" value={form.nom} onChange={handleChange} autoFocus />
          <label>Mot de passe</label>
          <div className="password-input-wrapper">
            <input
              name="motdepasse"
              type={showPassword ? 'text' : 'password'}
              value={form.motdepasse}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {isCapsLockOn && (
            <div className="caps-lock-warning">
              <FaExclamationTriangle /> Caps Lock est activé
            </div>
          )}

          {error && <div className="popup-error">{error}</div>}
          <button
            type="submit"
            className={`popup-submit ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : (t('topbar.logout') === 'Logout' ? 'Sign In' : 'Se connecter')}
          </button>

          <div className="popup-divider">OR</div>

          <button type="button" className="google-login-btn" onClick={() => alert('cette option est en cours de développement et va être disponible PROCHAINEMENT!')}>
            <FcGoogle className="google-icon" />
            {t('topbar.google_login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
