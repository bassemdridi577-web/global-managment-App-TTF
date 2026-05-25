import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

const ActionLogList = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/logs');
        setLogs(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const translateAction = (action) => {
    switch (action) {
      case 'user_created':
        return t('admin_panel.user_created');
      case 'user_modified':
        return t('admin_panel.user_modified');
      case 'user_supprime':
        return t('admin_panel.user_supprime');
      case 'pv_supprime':
        return t('admin_panel.pv_supprime');
      case 'pv_modified':
        return t('admin_panel.pv_modified');
      case 'pv_created':
        return t('admin_panel.pv_created');
      case 'delete_pv':
        return t('admin_panel.pv_supprime');
      default:
        return action;
    }
  };

  if (loading) return <div>{t('admin_panel.loading_logs')}</div>;
  if (error) return <div>{t('admin_panel.error_fetching_logs')}{error.message}</div>;

  return (
    <div className="user-management-container"> {/* Reusing some styles */}
      <h2>{t('admin_panel.action_logs')}</h2>
      <table>
        <thead>
          <tr>
            <th>{t('admin_panel.user')}</th>
            <th>{t('admin_panel.action')}</th>
            <th>{t('admin_panel.details')}</th>
            <th>{t('admin_panel.date')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            if (log.action === 'pv_supprime' || log.action === 'delete_pv') {
              console.log("Delete Log Details:", log.details);
            }
            return (
            <tr key={log.id}>
              <td>{log.user?.username || t('admin_panel.not_available')}</td>
              <td>{translateAction(log.action)}</td>
              <td>{log.details ? JSON.stringify(log.details) : '-'}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
};

export default ActionLogList;
