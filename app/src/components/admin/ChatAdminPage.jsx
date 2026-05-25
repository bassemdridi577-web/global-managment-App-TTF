import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { FaComments, FaRobot, FaTrash, FaEye, FaChevronLeft, FaSync, FaSearch } from 'react-icons/fa';
import './ChatAdminPage.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const roleLabel = (role) => {
    const map = {
        admin: 'Admin', tester: 'Laboratoire', quality_control: 'CQ',
        printer: 'Impression', apro: 'Appro', operator: 'Opérateur'
    };
    return map[role] || role;
};

const UserAvatar = ({ name, size = 32 }) => (
    <div className="chat-admin-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
        {(name || '?').charAt(0).toUpperCase()}
    </div>
);

// ─── Sub-views ────────────────────────────────────────────────────────────────

const ConversationMessages = ({ userA, userB, onBack, onDeleteConversation }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/chat/messages/${userA.id}/${userB.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
        setLoading(false);
    }, [userA.id, userB.id]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Supprimer ce message ? Cette action est irréversible.')) return;
        try {
            await api.delete(`/admin/chat/messages/${messageId}`);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (err) {
            console.error('Failed to delete message', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm(`Supprimer toute la conversation entre ${userA.username} et ${userB.username} ?`)) return;
        await onDeleteConversation(userA.id, userB.id);
        onBack();
    };

    const filtered = messages.filter(m =>
        !searchTerm || m.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="chat-admin-detail">
            <div className="chat-admin-detail-header">
                <button className="chat-admin-back-btn" onClick={onBack}>
                    <FaChevronLeft /> Retour
                </button>
                <div className="chat-admin-participants">
                    <UserAvatar name={userA.username} />
                    <span className="participant-name">{userA.username}</span>
                    <span className="participant-sep">↔</span>
                    <UserAvatar name={userB.username} />
                    <span className="participant-name">{userB.username}</span>
                </div>
                <div className="chat-admin-detail-actions">
                    <div className="chat-admin-search-mini">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="chat-admin-danger-btn" onClick={handleDeleteAll}>
                        <FaTrash /> Supprimer la conversation
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="chat-admin-loading">Chargement des messages...</div>
            ) : (
                <div className="chat-admin-messages-list">
                    {filtered.length === 0 ? (
                        <div className="chat-admin-empty">Aucun message trouvé.</div>
                    ) : (
                        filtered.map(msg => {
                            const isSenderA = msg.senderId === userA.id;
                            return (
                                <div key={msg.id} className={`admin-msg-row ${isSenderA ? 'msg-left' : 'msg-right'}`}>
                                    <UserAvatar name={msg.sender?.username} size={28} />
                                    <div className="admin-msg-bubble">
                                        <div className="admin-msg-meta">
                                            <span className="admin-msg-sender">{msg.sender?.username}</span>
                                            <span className="admin-msg-time">{formatDate(msg.createdAt)}</span>
                                        </div>
                                        <div className="admin-msg-content">{msg.content}</div>
                                    </div>
                                    <button
                                        className="admin-msg-delete-btn"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        title="Supprimer ce message"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const AiSessionMessages = ({ session, user, onBack, onDeleteSession }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/chat/ai-history/${session.id}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch AI history', err);
            }
            setLoading(false);
        };
        fetch();
    }, [session.id]);

    const handleDelete = async () => {
        if (!window.confirm('Supprimer cette session AI ?')) return;
        await onDeleteSession(session.id);
        onBack();
    };

    return (
        <div className="chat-admin-detail">
            <div className="chat-admin-detail-header">
                <button className="chat-admin-back-btn" onClick={onBack}>
                    <FaChevronLeft /> Retour
                </button>
                <div className="chat-admin-participants">
                    <UserAvatar name={user?.username} />
                    <span className="participant-name">{user?.username}</span>
                    <span className="participant-sep">·</span>
                    <span className="session-title-label">🤖 {session.title || 'Session AI'}</span>
                </div>
                <div className="chat-admin-detail-actions">
                    <button className="chat-admin-danger-btn" onClick={handleDelete}>
                        <FaTrash /> Supprimer la session
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="chat-admin-loading">Chargement...</div>
            ) : (
                <div className="chat-admin-messages-list">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`admin-msg-row ${msg.role === 'user' ? 'msg-right' : 'msg-left'}`}>
                            <div className={`admin-ai-avatar ${msg.role === 'assistant' ? 'ai-avatar' : ''}`}>
                                {msg.role === 'assistant' ? '🤖' : (user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-msg-bubble">
                                <div className="admin-msg-meta">
                                    <span className="admin-msg-sender">{msg.role === 'assistant' ? 'Assistant AI' : user?.username}</span>
                                    <span className="admin-msg-time">{formatDate(msg.createdAt)}</span>
                                </div>
                                <div className="admin-msg-content" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AiUserSessions = ({ stat, onBack, onDeleteSession }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingSession, setViewingSession] = useState(null);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/chat/ai-sessions/${stat.user.id}`);
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch AI sessions', err);
        }
        setLoading(false);
    }, [stat.user.id]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const handleDeleteSession = async (sessionId) => {
        try {
            await api.delete(`/admin/chat/ai-sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (viewingSession?.id === sessionId) setViewingSession(null);
            if (onDeleteSession) onDeleteSession(sessionId);
        } catch (err) {
            console.error('Failed to delete session', err);
        }
    };

    if (viewingSession) {
        return (
            <AiSessionMessages
                session={viewingSession}
                user={stat.user}
                onBack={() => setViewingSession(null)}
                onDeleteSession={handleDeleteSession}
            />
        );
    }

    return (
        <div className="chat-admin-detail">
            <div className="chat-admin-detail-header">
                <button className="chat-admin-back-btn" onClick={onBack}>
                    <FaChevronLeft /> Retour
                </button>
                <div className="chat-admin-participants">
                    <UserAvatar name={stat.user?.username} />
                    <span className="participant-name">{stat.user?.username}</span>
                    <span className="participant-sep">·</span>
                    <span className="session-title-label">Sessions AI ({sessions.length})</span>
                </div>
            </div>

            {loading ? (
                <div className="chat-admin-loading">Chargement...</div>
            ) : (
                <div className="chat-admin-table-wrapper">
                    <table className="chat-admin-table">
                        <thead>
                            <tr>
                                <th>Titre de la session</th>
                                <th>Messages</th>
                                <th>Dernière activité</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr><td colSpan="4" className="td-centered">Aucune session trouvée.</td></tr>
                            ) : (
                                sessions.map(session => (
                                    <tr key={session.id}>
                                        <td>
                                            <div className="session-title-cell">
                                                <span className="session-icon">🤖</span>
                                                <span className="user-name">{session.title || 'Nouvelle discussion'}</span>
                                            </div>
                                        </td>
                                        <td>{session._count?.messages || 0}</td>
                                        <td>{formatDate(session.updatedAt)}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="row-btn view" title="Voir les messages" onClick={() => setViewingSession(session)}>
                                                    <FaEye /> Voir
                                                </button>
                                                <button className="row-btn delete" title="Supprimer la session" onClick={() => {
                                                    if (window.confirm('Supprimer cette session ?')) handleDeleteSession(session.id);
                                                }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────

const UserChatDetails = ({ user, onBack, onDeleteConversation }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingConv, setViewingConv] = useState(null);

    const fetchUserConvs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/chat/conversations');
            // Filter only conversations where this user is involved
            const userConvs = res.data.filter(c => c.userA.id === user.id || c.userB.id === user.id);
            setConversations(userConvs);
        } catch (err) {
            console.error('Failed to fetch user conversations', err);
        }
        setLoading(false);
    }, [user.id]);

    useEffect(() => { fetchUserConvs(); }, [fetchUserConvs]);

    if (viewingConv) {
        return (
            <ConversationMessages
                userA={viewingConv.userA}
                userB={viewingConv.userB}
                onBack={() => setViewingConv(null)}
                onDeleteConversation={async (a, b) => {
                    await onDeleteConversation(a, b);
                    fetchUserConvs();
                }}
            />
        );
    }

    return (
        <div className="chat-admin-detail">
            <div className="chat-admin-detail-header">
                <button className="chat-admin-back-btn" onClick={onBack}>
                    <FaChevronLeft /> Retour à la liste
                </button>
                <div className="chat-admin-participants">
                    <UserAvatar name={user.username} />
                    <span className="participant-name">Conversations de {user.username}</span>
                </div>
            </div>

            <div className="chat-admin-table-wrapper">
                <table className="chat-admin-table">
                    <thead>
                        <tr>
                            <th>Interlocuteur</th>
                            <th>Messages</th>
                            <th>Dernière activité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="td-centered">Chargement...</td></tr>
                        ) : conversations.length === 0 ? (
                            <tr><td colSpan="4" className="td-centered">Aucune conversation.</td></tr>
                        ) : (
                            conversations.map((c, idx) => {
                                const other = c.userA.id === user.id ? c.userB : c.userA;
                                return (
                                    <tr key={idx}>
                                        <td>
                                            <div className="user-cell">
                                                <UserAvatar name={other.username} size={24} />
                                                <span className="user-name">{other.username}</span>
                                                <span className="user-badge">{roleLabel(other.role)}</span>
                                            </div>
                                        </td>
                                        <td>{c.messageCount}</td>
                                        <td>{formatDate(c.lastMessageAt)}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="row-btn view" title="Voir les messages" onClick={() => setViewingConv(c)}>
                                                    <FaEye /> Voir
                                                </button>
                                                <button className="row-btn delete" title="Supprimer la conversation" onClick={() => {
                                                    if (window.confirm(`Supprimer la conversation avec ${other.username} ?`))
                                                        onDeleteConversation(c.userA.id, c.userB.id).then(fetchUserConvs);
                                                }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserConversationsTab = () => {
    const [userStats, setUserStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUserStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/chat/user-stats');
            setUserStats(res.data);
        } catch (err) {
            console.error('Failed to fetch user chat stats', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchUserStats(); }, [fetchUserStats]);

    const handleDeleteConversation = async (userAId, userBId) => {
        try {
            await api.delete(`/admin/chat/conversations/${userAId}/${userBId}`);
            fetchUserStats();
        } catch (err) {
            console.error('Failed to delete conversation', err);
        }
    };

    const filtered = userStats.filter(s =>
        !searchTerm ||
        s.user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedUser) {
        return (
            <UserChatDetails
                user={selectedUser}
                onBack={() => setSelectedUser(null)}
                onDeleteConversation={handleDeleteConversation}
            />
        );
    }

    return (
        <div className="chat-admin-tab-content">
            <div className="chat-admin-controls">
                <div className="chat-admin-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="chat-admin-refresh-btn" onClick={fetchUserStats}>
                    <FaSync /> Rafraîchir
                </button>
            </div>

            <div className="chat-admin-table-wrapper">
                <table className="chat-admin-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Conversations</th>
                            <th>Total Messages</th>
                            <th>Dernière activité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="td-centered">Chargement...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="5" className="td-centered">Aucun utilisateur trouvé.</td></tr>
                        ) : (
                            filtered.map((s, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="user-cell">
                                            <UserAvatar name={s.user?.username} size={24} />
                                            <span className="user-name">{s.user?.username}</span>
                                            <span className="user-badge">{roleLabel(s.user?.role)}</span>
                                        </div>
                                    </td>
                                    <td>{s.conversationsCount}</td>
                                    <td>{s.messagesCount}</td>
                                    <td>{formatDate(s.lastActivity)}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="row-btn view" title="Voir les conversations" onClick={() => setSelectedUser(s.user)}>
                                                <FaEye /> Voir les discussions
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AiChatStatsTab = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingUserStat, setViewingUserStat] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/chat/ai-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch AI stats', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    if (viewingUserStat) {
        return (
            <AiUserSessions
                stat={viewingUserStat}
                onBack={() => setViewingUserStat(null)}
                onDeleteSession={() => fetchStats()}
            />
        );
    }

    return (
        <div className="chat-admin-tab-content">
            <div className="chat-admin-controls">
                <button className="chat-admin-refresh-btn" onClick={fetchStats}>
                    <FaSync /> Rafraîchir les statistiques
                </button>
            </div>

            <div className="chat-admin-table-wrapper">
                <table className="chat-admin-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Sessions AI</th>
                            <th>Total Messages</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="td-centered">Chargement...</td></tr>
                        ) : stats.length === 0 ? (
                            <tr><td colSpan="4" className="td-centered">Aucune utilisation de l'IA enregistrée.</td></tr>
                        ) : (
                            stats.map((s, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="user-cell">
                                            <UserAvatar name={s.user?.username} size={24} />
                                            <span className="user-name">{s.user?.username}</span>
                                            <span className="user-badge">{roleLabel(s.user?.role)}</span>
                                        </div>
                                    </td>
                                    <td>{s.sessionCount}</td>
                                    <td>{s.messageCount}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="row-btn view" title="Voir les sessions" onClick={() => setViewingUserStat(s)}>
                                                <FaEye /> Voir les discussions
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ChatSettingsTab = () => {
    const [settings, setSettings] = useState({
        aiEnabled: true,
        aiTemperature: 0.7,
        aiSystemPrompt: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/chat/settings');
                setSettings(res.data);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/admin/chat/settings', settings);
            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Failed to save settings', err);
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        }
        setSaving(false);
    };

    if (loading) return <div className="chat-admin-loading">Chargement...</div>;

    return (
        <div className="chat-admin-tab-content">
            <form className="chat-settings-form" onSubmit={handleSave}>
                <div className="settings-section">
                    <h3>Paramètres de l'IA</h3>

                    <div className="setting-field">
                        <label className="field-label">
                            <span>Activer l'Assistant IA</span>
                            <div className="switch-wrapper">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.aiEnabled}
                                        onChange={e => setSettings(prev => ({ ...prev, aiEnabled: e.target.checked }))}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className={`status-text ${settings.aiEnabled ? 'active' : ''}`}>
                                    {settings.aiEnabled ? 'Activé' : 'Désactivé'}
                                </span>
                            </div>
                        </label>
                        <p className="field-hint">Désactive globalement l'accès à l'IA pour tous les utilisateurs.</p>
                    </div>

                    <div className="setting-field">
                        <label className="field-label">Température du modèle ({settings.aiTemperature})</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.aiTemperature}
                            onChange={e => setSettings(prev => ({ ...prev, aiTemperature: parseFloat(e.target.value) }))}
                            className="range-input"
                        />
                        <p className="field-hint">0 = Strict et précis, 1 = Créatif et varié.</p>
                    </div>

                    <div className="setting-field">
                        <label className="field-label">Instructions système (Prompt)</label>
                        <textarea
                            rows="6"
                            value={settings.aiSystemPrompt}
                            onChange={e => setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                            placeholder="Ex: Tu es un assistant expert..."
                            className="prompt-textarea"
                        />
                        <p className="field-hint">Définit la personnalité et les connaissances de base de l'IA.</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`settings-msg ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="settings-actions">
                    <button type="submit" className="save-settings-btn" disabled={saving}>
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ChatAdminPage = () => {
    const [activeTab, setActiveTab] = useState('internal'); // 'internal', 'ai', or 'settings'

    return (
        <div className="chat-admin-container">
            <div className="chat-admin-header-main">
                <div className="chat-admin-tabs-nav">
                    <button
                        className={`admin-panel-tab ${activeTab === 'internal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('internal')}
                    >
                        <FaComments /> Messagerie Interne
                    </button>
                    <button
                        className={`admin-panel-tab ${activeTab === 'ai' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai')}
                    >
                        <FaRobot /> Assistant AI
                    </button>
                    <button
                        className={`admin-panel-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span style={{ marginRight: '8px' }}>⚙️</span> Paramètres
                    </button>
                </div>
            </div>

            <div className="chat-admin-content-area">
                {activeTab === 'internal' && <UserConversationsTab />}
                {activeTab === 'ai' && <AiChatStatsTab />}
                {activeTab === 'settings' && <ChatSettingsTab />}
            </div>
        </div>
    );
};

export default ChatAdminPage;
