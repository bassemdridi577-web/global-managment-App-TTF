import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsContainer from './SettingsContainer';
import usePwaInstall from '../../hooks/usePwaInstall';
import './SettingsPage.css';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(i18n.language);
  const [isUpdating, setIsUpdating] = useState(false);

  const forceAppUpdate = async () => {
    setIsUpdating(true);
    try {
      // Clear all service worker caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister current SW and re-register a fresh one
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
        await navigator.serviceWorker.register('/service-worker.js');
      }

      // Hard reload to fetch everything fresh from the server
      window.location.reload(true);
    } catch (error) {
      console.error('Force update failed:', error);
      setIsUpdating(false);
      alert(t('settings.update_failed'));
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange')); // Dispatch custom event
    alert(t('settings.settings_saved')); // Placeholder for user feedback
  };

  const actions = (
    <>
      <button className="sp-btn sp-save" onClick={handleSave}>{t('settings.save')}</button>
      <button className="sp-btn sp-cancel">{t('settings.cancel')}</button>
    </>
  );

  return (
    <SettingsContainer title={t('settings.title')} actions={actions}>
      <section className="sp-section">
        <h3 className="sp-section-title">{t('settings.general')}</h3>
        <div className="sp-grid">
          <label>{t('settings.theme')}</label>
          <select value={theme} onChange={handleThemeChange}>
            <option value="light">{t('settings.light')}</option>
            <option value="dark">{t('settings.dark')}</option>
          </select>

          <label>{t('settings.language')}</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">{t('settings.english')}</option>
            <option value="fr">{t('settings.french')}</option>
          </select>
        </div>
      </section>

      <section className="sp-section">
        <h3 className="sp-section-title">{t('settings.account')}</h3>
        <div className="sp-grid">
          <label>{t('settings.email')}</label>
          <input type="email" defaultValue="user@example.com" readOnly />

          <label>{t('settings.password')}</label>
          <button className="sp-btn sp-change-password">{t('settings.change_password')}</button>
        </div>
      </section>

      <section className="sp-section sp-install-section">
        <h3 className="sp-section-title">{t('settings.install_app')}</h3>
        <div className="sp-install-content">
          {isInstalled ? (
            <div className="sp-install-status sp-installed">
              <span className="sp-install-icon">✅</span>
              <p>{t('settings.app_already_installed')}</p>
            </div>
          ) : isInstallable ? (
            <div className="sp-install-status sp-installable">
              <span className="sp-install-icon">📲</span>
              <p>{t('settings.install_app_description')}</p>
              <button className="sp-btn sp-install-btn" onClick={promptInstall}>
                {t('settings.download_app')}
              </button>
            </div>
          ) : (
            <div className="sp-install-status sp-not-available">
              <span className="sp-install-icon">ℹ️</span>
              <p>{t('settings.install_not_available')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="sp-section sp-install-section">
        <h3 className="sp-section-title">{t('settings.app_updates')}</h3>
        <div className="sp-install-content">
          <div className="sp-install-status sp-update-section">
            <span className="sp-install-icon">🔄</span>
            <p>{t('settings.force_update_description')}</p>
            <button
              className="sp-btn sp-update-btn"
              onClick={forceAppUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? t('settings.updating') : t('settings.force_update')}
            </button>
          </div>
        </div>
      </section>

    </SettingsContainer>
  );
};

export default SettingsPage;