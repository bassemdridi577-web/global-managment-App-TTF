import React, { useState } from 'react';
import './Popups.css';

const CreateAccountPopup = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    labo: '',
    nom: '',
    motdepasse: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.labo || !form.nom || !form.motdepasse || !form.confirm) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (form.motdepasse !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
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

    Promise.resolve(onSubmit(form))
      .catch((err) => {
        setError(err.message || 'Erreur lors de la création du compte.');
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>&times;</button>
        <h2>Créer un compte</h2>
        <form onSubmit={handleSubmit} className="popup-form">
          <label>Département</label>
          <input name="labo" type="text" value={form.labo} onChange={handleChange} autoFocus />
          <label>Nom</label>
          <input name="nom" type="text" value={form.nom} onChange={handleChange} />
          <label>Mot de passe</label>
          <input name="motdepasse" type="password" value={form.motdepasse} onChange={handleChange} />
          <label>Confirmer mot de passe</label>
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} />
           {error && <div className="popup-error">{error}</div>}
          <button 
            type="submit" 
            className={`popup-submit ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Création...' : 'Créer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPopup;
