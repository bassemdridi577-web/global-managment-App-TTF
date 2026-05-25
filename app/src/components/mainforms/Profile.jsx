import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '../utils/session-service';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../layout/Footer';
import './Profile.css';
import { updateUser } from '../../api';

const Profile = () => {
  const { t } = useTranslation();
  const { controleur, sessionStart, loading } = useSession();
  const [laboname, setLaboname] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.edit || false);

  useEffect(() => {
    if (controleur) {
      setLaboname(controleur.laboname || '');
      setEmail(controleur.email || '');
    }
  }, [controleur]);

  const handleSave = async () => {
    if (!controleur || !controleur.id) {
      console.error('User ID is missing. Cannot update profile.');
      return;
    }
    try {
      const dataToUpdate = { laboname, email };
      const response = await updateUser(controleur.id, dataToUpdate);
      sessionStart(response.data);
      setIsEditing(false);
      // Clear navigation state to prevent re-entering edit mode on re-renders/refresh
      navigate('/profile', { replace: true, state: {} });
    } catch (error) {
      console.error('Failed to update user', error);
      alert(t('profile.profile_save_failed'));
    }
  };

  if (!controleur) {
    return (
      <div className="profile-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="waiting-message">waiting for informations...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-image-section">
            <img
              src={process.env.PUBLIC_URL + '/TT2.png'}
              alt="Tunisie Transformateur Logo"
              className="profile-logo"
            />
          </div>

          <div className="profile-content">
            <header className="profile-header">
              <h1 className="profile-title">Profil Utilisateur</h1>
              <p className="profile-subtitle">Gérez vos informations personnelles et professionnelles</p>
            </header>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Nom d'utilisateur</span>
                <div className="profile-info-value">{controleur.username || 'Non connecté'}</div>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Département </span>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={laboname}
                    onChange={(e) => setLaboname(e.target.value)}
                    placeholder="Entrez votre département"
                  />
                ) : (
                  <div className="profile-info-value">{laboname || '-'}</div>
                )}
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Adresse Email</span>
                {isEditing ? (
                  <input
                    type="email"
                    className="profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="profile-info-value">{email || '-'}</div>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <button className="btn-profile btn-save" onClick={handleSave} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              ) : (
                <button className="btn-profile btn-edit" onClick={() => setIsEditing(true)}>
                  Modifier le profil
                </button>
              )}
              <button className="btn-profile btn-back" onClick={() => navigate(-1)}>
                Retour
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
