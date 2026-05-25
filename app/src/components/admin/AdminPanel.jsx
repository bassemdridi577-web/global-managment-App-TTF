import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import ActionLogList from './ActionLogList';
import ChatAdminPage from './ChatAdminPage';
import {
  refreshAllClients,
  verifyAdminCode,
  getBackupStatus,
  toggleBackup,
  triggerManualBackup
} from '../../api'; // Import the backup functions
import './AdminPanel.css';
import './UserManagement.css';

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [codeEntered, setCodeEntered] = useState(() => sessionStorage.getItem('adminCodeEntered') || '');
  const [isCodeVerified, setIsCodeVerified] = useState(() => sessionStorage.getItem('isAdminCodeVerified') === 'true');
  const [codeError, setCodeError] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    return savedTab || 'users';
  }); // 'users', 'logs', or 'db'
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    // Reset code verification when tab changes to something other than protected ones
    if (activeTab !== 'db' && activeTab !== 'chat') {
      setIsCodeVerified(false);
      setCodeEntered('');
      setCodeError('');
    }
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('adminCodeEntered', codeEntered);
  }, [codeEntered]);

  useEffect(() => {
    sessionStorage.setItem('isAdminCodeVerified', isCodeVerified);
    if (isCodeVerified && activeTab === 'db') {
      fetchBackupStatus();
    }
  }, [isCodeVerified, activeTab]);

  const fetchBackupStatus = async () => {
    try {
      const response = await getBackupStatus();
      setAutoBackupEnabled(response.data.autoBackupEnabled);
    } catch (error) {
      console.error('Error fetching backup status:', error);
    }
  };

  const handleToggleBackup = async () => {
    if (backupLoading) return;
    setBackupLoading(true);
    try {
      const newStatus = !autoBackupEnabled;
      const response = await toggleBackup(newStatus);
      if (response.data.enabled !== undefined) {
        setAutoBackupEnabled(response.data.enabled);
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(t('admin_panel.error_toggling_backup'));
      console.error('Error toggling backup:', error);
    }
    setBackupLoading(false);
  };

  const handleTriggerBackup = async () => {
    if (backupLoading) return;
    setBackupLoading(true);
    try {
      const response = await triggerManualBackup();
      setMessage(response.data.message);
    } catch (error) {
      setMessage(t('admin_panel.error_triggering_backup'));
      console.error('Error triggering backup:', error);
    }
    setBackupLoading(false);
  };

  const handleBackToApp = () => {
    navigate('/acceuil'); // Navigate back to the main application's home page
  };


  const handleRefreshAllApps = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await refreshAllClients(); // This function will be defined in api.js
      setMessage(response.data.message);
    } catch (error) {
      setMessage(t('admin_panel.error_refreshing_all_apps'));
      console.error('Error refreshing all apps:', error);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setCodeError('');
    try {
      const response = await verifyAdminCode(codeEntered);
      if (response.data.success) {
        setIsCodeVerified(true);
        setMessage(t('admin_panel.code_verified'));
      } else {
        setCodeError(t('admin_panel.incorrect_code'));
        setIsCodeVerified(false);
      }
    } catch (error) {
      setCodeError(t('admin_panel.error_verifying_code'));
      console.error('Error verifying code:', error);
      setIsCodeVerified(false);
    }
    setLoading(false);
  };

  return (
    <div className="admin-panel-container">
      <header className="admin-panel-header">
        <h1>{t('admin_panel.title')}</h1>
        <button onClick={handleBackToApp} className="admin-panel-back-button">
          {t('admin_panel.back_to_app')}
        </button>
      </header>
      <p>{t('admin_panel.welcome_message')}</p>

      <div className="admin-panel-tabs">
        <button
          className={`admin-panel-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t('admin_panel.user_management')}
        </button>
        <button
          className={`admin-panel-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          {t('admin_panel.action_logs')}
        </button>
        <button
          className={`admin-panel-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          {t('admin_panel.chat_administration', 'Chat')}
        </button>
        <button
          className={`admin-panel-tab ${activeTab === 'db' ? 'active' : ''}`}
          onClick={() => setActiveTab('db')}
        >
          {t('admin_panel.system_actions')}
        </button>
      </div>

      <div className="admin-panel-sections">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'logs' && <ActionLogList />}

        {/* Protected Tabs: Chat and DB Actions */}
        {(activeTab === 'chat' || activeTab === 'db') && (
          <div className="admin-panel-section">
            <h2>{activeTab === 'chat' ? t('admin_panel.chat_administration', 'Gestion du Chat') : t('admin_panel.system_actions')}</h2>

            {!isCodeVerified ? (
              /* Verification Gate */
              <div className="code-verification-section">
                <p>{t('admin_panel.enter_code_prompt')}</p>
                <input
                  type="password"
                  value={codeEntered}
                  onChange={(e) => setCodeEntered(e.target.value)}
                  placeholder={t('admin_panel.enter_code_placeholder')}
                  className="code-input"
                  autoComplete="new-password"
                />
                <button onClick={handleVerifyCode} disabled={loading} className="admin-action-button">
                  {loading ? t('admin_panel.verifying') : t('admin_panel.verify_code')}
                </button>
                {codeError && <p className="error-message">{codeError}</p>}
              </div>
            ) : (
              /* Content once verified */
              <>
                {activeTab === 'chat' && <ChatAdminPage />}
                {activeTab === 'db' && (
                  <div className="admin-db-actions">
                    <div className="backup-control-section">
                      <h3>{t('admin_panel.database_backup')}</h3>
                      <div className="backup-toggle-container">
                        <span>{t('admin_panel.auto_backup_status')}: <strong>{autoBackupEnabled ? t('admin_panel.enabled') : t('admin_panel.disabled')}</strong></span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={autoBackupEnabled}
                            onChange={handleToggleBackup}
                            disabled={backupLoading}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                      <button onClick={handleTriggerBackup} disabled={backupLoading} className="admin-action-button manual-backup-btn">
                        {backupLoading ? t('admin_panel.processing') : t('admin_panel.trigger_manual_backup')}
                      </button>
                    </div>

                    <div className="other-actions-section">
                      <h3>{t('admin_panel.other_actions')}</h3>
                      <div className="action-buttons-group">
                        <button onClick={handleRefreshAllApps} disabled={loading} className="admin-action-button">
                          {loading ? t('admin_panel.refreshing') : t('admin_panel.refresh_all_apps')}
                        </button>
                      </div>
                    </div>
                    {message && <p className="admin-message">{message}</p>}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;