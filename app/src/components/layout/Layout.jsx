// src/components/layout/Layout.js
import React from 'react';
import TopBar from './TopBar.jsx';
import Sidebar from './Sidebar.jsx';
import './Layout.css';
import { useSidebar } from '../../context/SidebarContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, onLogout, currentUser, onEssaiClick, onCalculRapportClick, activeForm, setActiveForm }) => {
  const { isSidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const isTestEmail = currentUser?.email === 'test@example.com';
  const isEmailMissing = !currentUser?.email;
  const [showEmailWarning, setShowEmailWarning] = React.useState(false);

  React.useEffect(() => {
    if (currentUser && (isTestEmail || isEmailMissing)) {
      const lastDismissed = localStorage.getItem(`email_warning_dismissed_${currentUser.id}`);
      const today = new Date().toDateString();

      if (lastDismissed !== today) {
        setShowEmailWarning(true);
      }
    } else {
      setShowEmailWarning(false);
    }
  }, [currentUser, isTestEmail, isEmailMissing]);

  const handleDismissWarning = () => {
    localStorage.setItem(`email_warning_dismissed_${currentUser.id}`, new Date().toDateString());
    setShowEmailWarning(false);
  };

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <TopBar onLogout={onLogout} currentUser={currentUser} toggleSidebar={toggleSidebar} />
      <div className="layout-body">
        <div
          className="layout-overlay"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={!isSidebarCollapsed}
          onEssaiClick={onEssaiClick}
          onCalculRapportClick={onCalculRapportClick}
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          currentUser={currentUser}
        />
        <main className="layout-content">
          {showEmailWarning && (
            <div className="email-warning-banner">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">
                {isEmailMissing ? t('profile.email_required_message') : t('profile.test_email_warning')}
              </span>
              <div className="banner-actions">
                <button className="update-email-btn" onClick={() => navigate('/profile', { state: { edit: true } })}>
                  {t('profile.update_now')}
                </button>
                <button className="dismiss-banner-btn" onClick={handleDismissWarning}>
                  &times;
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
