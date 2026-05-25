import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '../../context/WebSocketContext';
import './PresenceList.css';

const PresenceList = () => {
    const { t } = useTranslation();
    const { onlineUsers } = useWebSocket();

    const usersArray = Array.from(onlineUsers.values());
    
    // Sort: Online first, then by username
    const sortedUsers = usersArray.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
            return (a.username || '').localeCompare(b.username || '');
        }
        return a.isOnline ? -1 : 1;
    });

    const formatLastSeen = (dateString) => {
        if (!dateString) return t('presence.never', 'Jamais');
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('presence.just_now', "À l'instant");
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}j`;
    };

    return (
        <div className="presence-list">
            <div className="presence-header">
                <h3>{t('presence.title', 'Utilisateurs')}</h3>
                <span className="online-count">
                    {usersArray.filter(u => u.isOnline).length} {t('presence.online', 'en ligne')}
                </span>
            </div>
            <div className="presence-items">
                {sortedUsers.map((user, index) => (
                    <div key={index} className={`presence-item ${user.isOnline ? 'online' : 'offline'}`}>
                        <div className="user-avatar">
                            {(user.username || '?').charAt(0).toUpperCase()}
                            <span className="status-indicator"></span>
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.username}</div>
                            <div className="user-lab">{user.laboname}</div>
                        </div>
                        <div className="last-seen">
                            {user.isOnline ? t('presence.active', 'Actif') : formatLastSeen(user.lastSeen)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PresenceList;
