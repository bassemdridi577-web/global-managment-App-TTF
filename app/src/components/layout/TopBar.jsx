import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaBars, FaBell, FaComments, FaSignOutAlt, FaCommentDots, FaClipboardList, FaRobot, FaTimes, FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import './TopBar.css';
import PresenceList from './PresenceList.jsx';

import { useWebSocket } from '../../context/WebSocketContext';

const AI_NUDGE_SESSION_KEY = 'ai_nudge_shown';
const AI_NUDGE_DELAY_MS = 45_000;
const AI_NUDGE_AUTO_DISMISS_MS = 10_000;

const TopBar = ({ onLogout, currentUser, toggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [newCommandesCount, setNewCommandesCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newCommandesList, setNewCommandesList] = useState([]);
  const [showAiNudge, setShowAiNudge] = useState(false);
  const [chatBtnPulse, setChatBtnPulse] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const notificationRef = useRef(null);
  const presenceRef = useRef(null);
  const nudgeTimerRef = useRef(null);
  const nudgeDismissRef = useRef(null);

  const { unreadMessages, markAsRead, clearAllMessages, onlineUsers } = useWebSocket();
  const onlineCount = Array.from(onlineUsers.values()).filter(u => u.isOnline).length;
  const totalNotifications = newCommandesCount + unreadMessages.length;

  const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  // Check for new commands
  useEffect(() => {
    const fetchCommandesAndCheck = async () => {
      if (!currentUser) return; // Don't fetch if no user is logged in

      try {
        const res = await api.get('/commande?limit=1000');
        const data = res.data;
        let commandes = [];
        if (Array.isArray(data)) commandes = data;
        else if (Array.isArray(data.data)) commandes = data.data;
        else if (Array.isArray(data.commandes)) commandes = data.commandes;

        if (commandes.length > 0) {
          const lastSeenId = localStorage.getItem('lastSeenCommandeId');
          const sortedCommandes = [...commandes].sort((a, b) => b.id - a.id);
          const latestId = sortedCommandes[0]?.id;

          if (lastSeenId) {
            const newCmds = sortedCommandes.filter(c => c.id > parseInt(lastSeenId));
            setNewCommandesCount(newCmds.length);
            setNewCommandesList(newCmds);
          } else {
            if (latestId) {
              localStorage.setItem('lastSeenCommandeId', latestId.toString());
            }
          }
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error('Error checking for new commands:', err);
        }
      }
    };

    fetchCommandesAndCheck();
  }, [currentUser]);

  // AI nudge: show once per session after inactivity
  const resetNudgeTimer = useCallback(() => {
    if (!currentUser) return;
    if (sessionStorage.getItem(AI_NUDGE_SESSION_KEY)) return;
    clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => {
      if (!sessionStorage.getItem(AI_NUDGE_SESSION_KEY)) {
        setShowAiNudge(true);
        setChatBtnPulse(true);
        nudgeDismissRef.current = setTimeout(() => {
          setShowAiNudge(false);
          setChatBtnPulse(false);
        }, AI_NUDGE_AUTO_DISMISS_MS);
      }
    }, AI_NUDGE_DELAY_MS);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (sessionStorage.getItem(AI_NUDGE_SESSION_KEY)) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetNudgeTimer, { passive: true }));
    resetNudgeTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetNudgeTimer));
      clearTimeout(nudgeTimerRef.current);
      clearTimeout(nudgeDismissRef.current);
    };
  }, [currentUser, resetNudgeTimer]);

  const handleDismissNudge = () => {
    sessionStorage.setItem(AI_NUDGE_SESSION_KEY, '1');
    clearTimeout(nudgeDismissRef.current);
    setShowAiNudge(false);
    setChatBtnPulse(false);
  };

  const handleNudgeGoToChat = () => {
    handleDismissNudge();
    navigate('/ai-chat');
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (presenceRef.current && !presenceRef.current.contains(event.target)) {
        setShowPresence(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && newCommandesList.length > 0) {
      const latestId = newCommandesList[0].id;
      localStorage.setItem('lastSeenCommandeId', latestId.toString());
      setNewCommandesCount(0);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__logo">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="topbar__brand">
          <img
            src="/TT2.png"
            alt="Logo"
            className="topbar__logo-img"
          />
          <span className="topbar__logo-text">Tunisie Transformateurs</span>
        </div>
        <div className="portfolio-badge">
          PORTFOLIO DEMO
        </div>
      </div>

      <div className="topbar__search">
        {/* Placeholder for search functionality if needed later */}
      </div>

      <nav className="topbar__nav">
        {currentUser && (
          <>
            {/* AI Chat Button */}
            <Link
              to="/ai-chat"
              className={`chat-btn${chatBtnPulse ? ' chat-btn--pulse' : ''}`}
              title="AI Assistant"
              onClick={handleDismissNudge}
            >
              <FaComments />
              {unreadMessages.length > 0 && (
                <span className="unread-badge">
                  {unreadMessages.length}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <div
              ref={notificationRef}
              className="notification-container"
            >
              <button
                className={`notification-btn${totalNotifications > 0 ? ' has-notifications' : ''}`}
                onClick={handleNotificationClick}
              >
                <FaBell />
                {totalNotifications > 0 && (
                  <span className="notification-badge">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  {/* ── Header ── */}
                  <div className="dropdown-header">
                    <FaBell className="dropdown-header-icon" />
                    {t('topbar.notifications')}
                    {totalNotifications > 0 && (
                      <span className="dropdown-header-count">
                        {totalNotifications} {t('topbar.new', 'new')}
                      </span>
                    )}
                  </div>

                  <div className="dropdown-body">
                    {totalNotifications === 0 ? (
                      <div className="dropdown-empty">
                        <span className="dropdown-empty-icon">📭</span>
                        {t('topbar.no_notifications', 'Aucune nouvelle notification')}
                      </div>
                    ) : (
                      <>
                        {/* ── Messages Section ── */}
                        {unreadMessages.length > 0 && (
                          <>
                            <div className="dropdown-section-label">
                              <FaCommentDots /> {t('topbar.messages', 'Messages')}
                            </div>
                            <div className="dropdown-list-compact">
                              {Object.values(unreadMessages.reduce((acc, msg) => {
                                const sid = msg.senderId || 'unknown';
                                if (!acc[sid]) acc[sid] = {
                                  senderName: msg.sender?.username || (msg.senderId ? `Utilisateur #${msg.senderId}` : "Inconnu"),
                                  senderId: msg.senderId,
                                  messages: []
                                };
                                acc[sid].messages.push(msg);
                                return acc;
                              }, {})).map((group, groupIdx) => (
                                <div key={`group-${groupIdx}`} className="message-group-card">
                                  <div className="group-card-header">
                                    <div className="group-sender-name">
                                      👤 {group.senderName}
                                    </div>
                                    <Link
                                      to="/ai-chat"
                                      className="group-reply-btn"
                                      onClick={() => markAsRead(group.senderId)}
                                    >
                                      {t('topbar.reply', 'Répondre')} →
                                    </Link>
                                  </div>
                                  <div className="group-card-messages">
                                    {group.messages.map((m, mIdx) => (
                                      <div key={`m-${mIdx}`} className="group-mini-message">
                                        {m.content || (m.imageUrl ? "📷 Image" : "...")}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>                          </>
                        )}

                        {/* ── Commands Section ── */}
                        {newCommandesList.length > 0 && (
                          <>
                            <div className="dropdown-section-label">
                              <FaClipboardList /> {t('topbar.new_orders', 'Nouvelles commandes')}
                            </div>
                            <ul className="dropdown-list">
                              {newCommandesList.map(cmd => (
                                <li key={cmd.id} className="dropdown-item is-cmd">
                                  <div className="dropdown-item-icon cmd-icon">
                                    <FaClipboardList />
                                  </div>
                                  <div className="dropdown-item-content">
                                    <div className="cmd-title">Commande #{cmd.id}</div>
                                    <div className="cmd-details">Client : {cmd.client || 'N/A'}</div>
                                    <div className="cmd-date">
                                      {new Date(cmd.createdAt || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* ── Footer ── */}
                  {unreadMessages.length > 0 && (
                    <div className="dropdown-footer" style={{ justifyContent: 'center' }}>
                      <button
                        className="mark-all-read-btn"
                        onClick={clearAllMessages}
                      >
                        {t('topbar.mark_all_read', 'Tout marquer comme lu')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Online Presence Dropdown (Admin Only) */}
            {currentUser.role === 'admin' && (
              <div ref={presenceRef} className="notification-container">
                <button
                  className={`notification-btn ${onlineCount > 0 ? 'has-notifications' : ''}`}
                  onClick={() => {
                    setShowPresence(!showPresence);
                    setShowNotifications(false);
                  }}
                  title={t('topbar.online_users', 'Utilisateurs en ligne')}
                >
                  <FaUsers />
                  {onlineCount > 0 && (
                    <span className="notification-badge online-badge">
                      {onlineCount}
                    </span>
                  )}
                </button>
                {showPresence && (
                  <div className="presence-dropdown">
                    <PresenceList />
                  </div>
                )}
              </div>
            )}

            <Link to="/profile" className="topbar__user-info-link">
              <div className="topbar__user-info">
                <div className="topbar__user-details">
                  <span className="topbar__user-name">{currentUser.username || 'N/A'}</span>
                  <span className="topbar__user-lab">{t('topbar.department')}: {currentUser.laboname || 'N/A'}</span>
                </div>
                <div className="topbar__user-avatar">
                  {getInitials(currentUser.username)}
                </div>
              </div>
            </Link>
            <button className="logout-btn" onClick={onLogout} title={t('topbar.logout')}>
              <span className="logout-text">{t('topbar.logout')}</span>
              <FaSignOutAlt className="logout-icon" />
            </button>
          </>
        )}
      </nav>

      {/* AI Nudge floating hint (Portal to body for true centering) */}
      {showAiNudge && createPortal(
        <div className="ai-nudge-card" role="complementary" aria-label="AI suggestion">
          <button
            className="ai-nudge-close"
            onClick={handleDismissNudge}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
          <div className="ai-nudge-icon">
            <FaRobot />
          </div>
          <div className="ai-nudge-body">
            <p className="ai-nudge-title">💡 Savez-vous ?</p>
            <p className="ai-nudge-text">
              Notre IA peut répondre à vos questions métier instantanément avec capabilites d'auto-apprentissage.
            </p>
            <button className="ai-nudge-cta" onClick={handleNudgeGoToChat}>
              Essayer maintenant →
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default TopBar;