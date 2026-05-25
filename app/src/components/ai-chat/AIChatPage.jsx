import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AuthContext from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import './AIChatPage.css';
import './AIChatPageMobile.css';
import './AIChatUser.css';




const Typewriter = ({ text, speed = 1, onComplete, onUpdate }) => {
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        if (charIndex < text.length) {
            // Processing significantly more characters per "tick" to feel "snappy"
            // For long texts, we jump by 10-20 chars at a time
            const increment = text.length > 1500 ? 30 : (text.length > 800 ? 15 : (text.length > 300 ? 8 : 4));

            const timeout = setTimeout(() => {
                setCharIndex(prev => Math.min(prev + increment, text.length));
                if (onUpdate) onUpdate();
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            const timer = setTimeout(onComplete, 50);
            return () => clearTimeout(timer);
        }
    }, [charIndex, text.length, speed, onComplete, onUpdate]);

    return (
        <div className="typing-content markdown-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text.substring(0, charIndex)}
            </ReactMarkdown>
            {charIndex < text.length && <span className="streaming-cursor"></span>}
        </div>
    );
};


const AIChatPage = () => {
    const navigate = useNavigate();
    const { controleur, updateControleur } = useContext(AuthContext); // Current user
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('chat_active_tab') || 'ai'); // 'ai' or 'users'

    useEffect(() => {
        localStorage.setItem('chat_active_tab', activeTab);
    }, [activeTab]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showVisibilityInfo, setShowVisibilityInfo] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // AI Chat State
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInputMessage, setAiInputMessage] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const aiMessagesEndRef = useRef(null);
    const aiMessagesContainerRef = useRef(null);
    const aiInputRef = useRef(null);

    const translateRole = (role) => {
        const roles = {
            'admin': 'Administrateur',
            'tester': 'Laboratoire',
            'quality_control': 'Contrôle Qualité',
            'printer': 'Impression',
            'apro': 'Approvisionnement',
            'operator': 'Opérateur'
        };
        return roles[role] || role;
    };

    // User Chat State
    const [allUsers, setAllUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [userMessages, setUserMessages] = useState([]);
    const [userInputMessage, setUserInputMessage] = useState('');
    const [imageAttachment, setImageAttachment] = useState(null);
    const fileInputRef = useRef(null);
    const [activeContactIds, setActiveContactIds] = useState(() => {
        const saved = localStorage.getItem(`chat_active_contacts_${controleur?.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const userMessagesEndRef = useRef(null);
    const userInputRef = useRef(null);

    const { unreadMessages, markAsRead, clearAllMessages } = useWebSocket();

    // Derived unread counts for sidebar
    const unreadCounts = unreadMessages.reduce((acc, msg) => {
        acc[msg.senderId] = (acc[msg.senderId] || 0) + 1;
        return acc;
    }, {});

    // Sync global unread messages to local chat view
    useEffect(() => {
        if (activeTab === 'users' && selectedContact && unreadMessages.length > 0) {
            // Find messages from current contact
            const currentContactMessages = unreadMessages.filter(m => m.senderId === selectedContact.id);

            if (currentContactMessages.length > 0) {
                setUserMessages(prev => {
                    // Avoid duplicates
                    const newMsgs = currentContactMessages.filter(nm => !prev.some(pm => pm.id === nm.id));
                    if (newMsgs.length === 0) return prev;
                    return [...prev, ...newMsgs];
                });

                // Clear these from global unread state
                markAsRead(selectedContact.id);
                setTimeout(scrollToBottom, 100);
            }
        }
    }, [unreadMessages, selectedContact, activeTab, markAsRead]);

    // Remove the old WebSocket creation useEffect completely
    /* 
       The old useEffect that created 'new WebSocket' is replaced by this logic.
       The old handleIncomingMessage is also obsolete as we handle it via the Effect above.
    */

    const fetchSessions = useCallback(async () => {
        try {
            const response = await api.get('/chat/sessions');
            const fetchedSessions = response.data;
            setSessions(fetchedSessions);

            if (fetchedSessions.length > 0) {
                if (!activeSessionId && window.innerWidth >= 768) {
                    selectSession(fetchedSessions[0].id);
                }
            } else {
                createNewSession();
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId]);

    const createNewSession = async () => {
        // Check if current session is empty
        if (activeSessionId && aiMessages.length === 0) {
            return;
        }

        // Check if the most recent session is empty (reuse it)
        if (sessions.length > 0) {
            const latestSession = sessions[0];
            // Check _count from backend or fallback
            const msgCount = latestSession._count?.messages ?? 0;
            if (msgCount === 0) {
                if (activeSessionId !== latestSession.id) {
                    selectSession(latestSession.id);
                }
                return;
            }
        }

        try {
            const response = await api.post('/chat/sessions');
            const newSession = response.data;
            // Ensure structure consistency
            newSession._count = { messages: 0 };

            setSessions(prev => [newSession, ...prev]);
            selectSession(newSession.id);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation(); // Prevent clicking the session item
        if (!window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) return;

        try {
            await api.delete(`/chat/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));

            if (activeSessionId === sessionId) {
                setAiMessages([]);
                setActiveSessionId(null);
                // Optionally select the next available or create new
                const remaining = sessions.filter(s => s.id !== sessionId);
                if (remaining.length > 0) {
                    selectSession(remaining[0].id);
                } else {
                    createNewSession();
                }
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const selectSession = async (sessionId) => {
        setActiveSessionId(sessionId);
        setAiMessages([]); // Clear current view
        try {
            const response = await api.get(`/chat/history?sessionId=${sessionId}`);
            const formatted = response.data.map(msg => ({
                id: msg.id,
                type: msg.type, // 'assistant' or 'user' (backend returns updated role as type)
                content: msg.content,
                timestamp: new Date(msg.timestamp)
            }));
            setAiMessages(formatted);
            setTimeout(scrollToBottomAi, 100);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const isAtBottomAi = () => {
        if (!aiMessagesContainerRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = aiMessagesContainerRef.current;
        return scrollHeight - scrollTop - clientHeight < 150;
    };

    const scrollToBottomAi = () => {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBottomAiInstant = () => {
        if (aiMessagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = aiMessagesContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
            if (isNearBottom) {
                aiMessagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'ai') scrollToBottomAi();
    }, [aiMessages, isAiTyping, activeTab]);

    const handleSendAiMessage = async () => {
        if (!aiInputMessage.trim() || isAiLoading) return;

        // If no active session, create one first (should be handled by init, but as fallback)
        let targetSessionId = activeSessionId;
        if (!targetSessionId) {
            try {
                const sessionRes = await api.post('/chat/sessions');
                targetSessionId = sessionRes.data.id;
                setSessions(prev => [sessionRes.data, ...prev]);
                setActiveSessionId(targetSessionId);
            } catch (e) {
                console.error("Failed to create session on send", e);
                return;
            }
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: aiInputMessage,
            timestamp: new Date()
        };

        setAiMessages(prev => [...prev, userMessage]);
        setAiInputMessage('');
        setIsAiLoading(true);
        setIsAiTyping(true);

        try {
            const response = await api.post('/chat', {
                message: userMessage.content,
                sessionId: targetSessionId
            });

            const data = response.data;
            setIsAiTyping(false);

            // Log model info to browser console
            if (data.modelUsed) {
                console.log(`%c🤖 AI Model: ${data.modelUsed}`, "color: #4CAF50; font-weight: bold; font-size: 12px;");
            }

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: data.response,
                timestamp: new Date(),
                isNew: true // Flag to trigger typing effect
            };

            setAiMessages(prev => [...prev, assistantMessage]);

            // Refund sessions list to update title/timestamp if needed (optional optimization: update local state)
            fetchSessions();

        } catch (error) {
            setIsAiTyping(false);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
                timestamp: new Date()
            };
            setAiMessages(prev => [...prev, errorMessage]);
            console.error('Chat error:', error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAiKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendAiMessage();
        }
    };

    // --- User Chat Logic ---

    useEffect(() => {
        if (activeTab === 'ai') {
            fetchSessions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Poll for messages when a contact is selected
    useEffect(() => {
        if (activeTab === 'users' && selectedContact) {
            fetchUserMessages(selectedContact.id); // Initial fetch
            // Automatically mark as read when selecting the contact
            markAsRead(selectedContact.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, selectedContact]);

    // --- WebSocket Logic ---
    // Handled globally via WebSocketContext

    // const handleIncomingMessage ... (Removed)

    // Scroll Management
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const chatContainerRef = useRef(null); // Ref for the scrollable container

    const isAtBottom = () => {
        if (!chatContainerRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // Check if we are within 100px of the bottom
        return scrollHeight - scrollTop - clientHeight < 100;
    };

    const handleScroll = () => {
        const container = activeTab === 'users' ? chatContainerRef.current : aiMessagesContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const distance = scrollHeight - scrollTop - clientHeight;
            setShowScrollBtn(distance > 150);
        }
    };

    const scrollToBottomUserInstant = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
            if (isNearBottom) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    };

    const scrollToBottom = () => {
        const container = activeTab === 'users' ? chatContainerRef.current : aiMessagesContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Auto-scroll on tab switch
    useEffect(() => {
        if (activeTab === 'users') {
            setTimeout(scrollToBottom, 100);
        }
    }, [activeTab]);

    // Only scroll on new messages if we were ALREADY at the bottom (or close to it)
    // We removed the aggressive useEffect([userMessages])
    useEffect(() => {
        if (selectedContact && userMessages.length > 0) {
            // But we want to auto-scroll when opening a chat.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedContact, userMessages.length]);

    // Update the real-time message effect to be conditional
    useEffect(() => {
        if (activeTab === 'users' && selectedContact && unreadMessages.length > 0) {
            // Using String() for type-safe comparison
            const currentContactMessages = unreadMessages.filter(m => String(m.senderId) === String(selectedContact.id));

            if (currentContactMessages.length > 0) {
                const shouldScroll = isAtBottom();

                setUserMessages(prev => {
                    const newMsgs = currentContactMessages
                        .filter(nm => !prev.some(pm => String(pm.id) === String(nm.id)))
                        .map(m => ({ ...m, isNew: true }));

                    if (newMsgs.length === 0) return prev;
                    return [...prev, ...newMsgs];
                });

                markAsRead(selectedContact.id);

                if (shouldScroll) {
                    setTimeout(scrollToBottom, 100);
                }
            }
        }
    }, [unreadMessages, selectedContact, activeTab, markAsRead]);

    // Scroll to bottom when image is attached/previewed
    useEffect(() => {
        if (imageAttachment) {
            setTimeout(scrollToBottom, 100);
        }
    }, [imageAttachment]);


    const fetchContacts = async () => {
        try {
            const [usersRes, conversationsRes] = await Promise.all([
                api.get('/users'),
                api.get('/messages/conversations/list')
            ]);

            const others = usersRes.data.filter(u => u.id !== controleur?.id);
            setAllUsers(others.sort((a, b) => a.username.localeCompare(b.username)));
            setConversations(conversationsRes.data);
        } catch (error) {
            console.error('Error fetching contacts/conversations:', error);
        }
    };

    // Update localStorage when activeContactIds changes
    useEffect(() => {
        if (controleur?.id) {
            localStorage.setItem(`chat_active_contacts_${controleur.id}`, JSON.stringify(activeContactIds));
        }
    }, [activeContactIds, controleur?.id]);

    const handleAddContact = (contact) => {
        if (!activeContactIds.includes(contact.id) && !conversations.some(c => c.id === contact.id)) {
            setActiveContactIds(prev => [...prev, contact.id]);
        }
        setSelectedContact(contact);
        setShowUserSearch(false);
        setUserSearchTerm('');
    };

    // Merge server conversations and local "added" contacts
    // We deduplicate by ID just in case allUsers or activeContactIds have duplicates
    const activeContacts = allUsers.filter(u =>
        conversations.some(c => c.id === u.id) ||
        activeContactIds.includes(u.id) ||
        (unreadCounts[u.id] > 0)
    );

    const filteredSearchUsers = allUsers.filter(u => {
        // Exclude users already in active contacts or those who are hidden (unless you are admin? no, respect privacy)
        if (u.isHidden) return false;

        const isAlreadyActive = activeContacts.some(ac => ac.id === u.id);
        if (isAlreadyActive) return false;

        const searchLower = userSearchTerm.toLowerCase();
        return u.username.toLowerCase().includes(searchLower) ||
            u.role?.toLowerCase().includes(searchLower);
    });

    const fetchUserMessages = async (contactId, silent = false) => {
        try {
            const response = await api.get(`/messages/${contactId}`);
            setUserMessages(response.data);
            if (!silent) {
                setTimeout(scrollToBottom, 100);
                // Mark as read when messages are successfully fetched
                markAsRead(contactId);
            }
        } catch (error) {
            if (!silent) console.error('Error fetching messages:', error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('L\'image dépasse 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageAttachment(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendUserMessage = async () => {
        if ((!userInputMessage.trim() && !imageAttachment) || !selectedContact) return;

        const tempData = {
            id: 'temp-' + Date.now(),
            content: userInputMessage,
            imageUrl: imageAttachment, // Temporary, optimistically showing base64
            senderId: controleur.id,
            receiverId: selectedContact.id,
            createdAt: new Date().toISOString(),
            sender: { id: controleur.id, username: controleur.username },
            receiver: selectedContact
        };

        // Optimistic update
        setUserMessages(prev => [...prev, tempData]);
        setUserInputMessage('');
        const currentImage = imageAttachment;
        setImageAttachment(null);

        // Also mark as read for current contact when sending a message
        markAsRead(selectedContact.id);

        try {
            await api.post('/messages', {
                receiverId: selectedContact.id,
                content: tempData.content,
                imageBase64: currentImage
            });
            // Refresh conversations list to ensure consistency
            const conversationsRes = await api.get('/messages/conversations/list');
            setConversations(conversationsRes.data);

            // Fetch to get the real message with reliable ID and timestamp
            fetchUserMessages(selectedContact.id, true);
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally, remove the temp message if failed
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Supprimer ce message ?")) return;

        try {
            // Check if it's a temporary optimistic message
            if (String(messageId).startsWith('temp-')) {
                 setUserMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));
                 return;
            }
            
            await api.delete(`/messages/${messageId}`);
            setUserMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    const toggleVisibility = async () => {
        try {
            const newIsHidden = !controleur.isHidden;
            const response = await api.put(`/users/${controleur.id}`, { isHidden: newIsHidden });
            updateControleur(response.data);
        } catch (error) {
            console.error("Failed to update visibility", error);
            alert("Erreur lors de la mise à jour de la visibilité.");
        }
    };

    const handleDeleteConversation = async (e, contactId) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer toute la conversation ? Cette action est irréversible.")) return;

        try {
            await api.delete(`/messages/conversations/${contactId}`);

            // Update local state
            setConversations(prev => prev.filter(c => c.id !== contactId));
            setActiveContactIds(prev => prev.filter(id => id !== contactId));

            if (selectedContact?.id === contactId) {
                setSelectedContact(null);
                setUserMessages([]);
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
            alert("Erreur lors de la suppression de la conversation.");
        }
    };

    const handleUserKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendUserMessage();
        }
    };



    const handleLocalAIClick = async (e) => {
        e.preventDefault();
        const url = "http://192.168.1.67:8080/";

        try {
            // Attempt a quick check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            await fetch(url, { mode: 'no-cors', signal: controller.signal });
            clearTimeout(timeoutId);

            // If we reach here, it's likely up (or at least responding)
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("Local AI check failed:", error);
            setShowErrorModal(true);
        }
    };


    // --- Common Helper ---
    const formatTime = (dateInput) => {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const aiDisplayTitle = activeSession ? (activeSession.title || 'Conversation AI') : 'Conversation AI';

    return (
        <div className="ai-chat-container">
            <div className="ai-chat-wrapper">
                {/* Header */}
                <div className="ai-chat-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <h2 className="chat-page-title">Chat TTF</h2>

                    {/* Tabs */}
                    <div className="chat-tabs">
                        <button
                            className={`chat-tab ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <span className="tab-icon">🤖</span>
                            Chat AI
                        </button>
                        <button
                            className={`chat-tab ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <span className="tab-icon">💬</span>
                            Messagerie
                            {unreadMessages.length > 0 && (
                                <span className="tab-badge">
                                    {unreadMessages.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="header-right-actions">
                        <button
                            onClick={handleLocalAIClick}
                            className="local-ai-btn"
                            title="Lancer l'AI locale"
                        >
                            <span className="tab-icon">🚀</span>
                            <span className="desktop-text">Pour découvrir un AI local plus developpé click ici (même sans internet)</span>
                            <span className="mobile-text">AI Local</span>
                        </button>
                    </div>
                </div>

                {/* AI Chat View */}
                {activeTab === 'ai' && (
                    <div className={`user-chat-layout ${activeSessionId ? 'mobile-chat-active' : 'mobile-list-active'}`}>
                        {/* Sidebar: Sessions List */}
                        <div className="contacts-sidebar sessions-sidebar">
                            <button className="new-chat-btn" onClick={createNewSession}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Nouvelle conversation
                            </button>

                            <div className="sidebar-divider"></div>

                            <div className="contacts-list sessions-list">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={`contact-item session-item ${activeSessionId === session.id ? 'active' : ''}`}
                                        onClick={() => selectSession(session.id)}
                                    >
                                        <div className="contact-info session-info">
                                            <div className="contact-name session-title">{session.title || 'Nouvelle discussion'}</div>
                                            <div className="contact-role session-date">
                                                {new Date(session.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            className="delete-session-btn"
                                            onClick={(e) => deleteSession(e, session.id)}
                                            title="Supprimer la conversation"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="user-chat-main">
                            {/* Mobile Header for AI */}
                            <div className="mobile-header-container"> {/* controlled by css */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="mobile-only-header">
                                    <button className="mobile-back-btn" onClick={() => setActiveSessionId(null)}>
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <span style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {aiDisplayTitle}
                                    </span>
                                </div>
                            </div>
                            <div
                                className="ai-chat-messages"
                                ref={aiMessagesContainerRef}
                                onScroll={handleScroll}
                            >
                                <div className="messages-inner">
                                    {aiMessages.length === 0 && !isAiLoading && (
                                        <div className="empty-state-ai">
                                            <p>✨ Posez une question pour commencer...</p>
                                        </div>
                                    )}
                                    {aiMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`message-wrapper ${message.type}-message`}
                                        >
                                            <div className="message-bubble">
                                                {message.type === 'assistant' && (
                                                    <div className="message-avatar">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="message-content">
                                                    {message.type === 'assistant' ? (
                                                        message.isNew ? (
                                                            <Typewriter
                                                                text={message.content}
                                                                onComplete={() => {
                                                                    setAiMessages(prev => prev.map(m => m.id === message.id ? { ...m, isNew: false } : m));
                                                                }}
                                                                onUpdate={scrollToBottomAiInstant}
                                                            />
                                                        ) : (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        )
                                                    ) : (
                                                        <p>{message.content}</p>
                                                    )}
                                                    <span className="message-time">{formatTime(message.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isAiTyping && (
                                        <div className="message-wrapper assistant-message">
                                            <div className="message-bubble">
                                                <div className="message-avatar">
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div className="message-content">
                                                    <div className="typing-indicator">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                    <span className="typing-text">Chargement...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={aiMessagesEndRef} />
                                </div>
                            </div>

                            {/* Sticky Scroll Button for AI */}
                            {showScrollBtn && (
                                <button
                                    className="sticky-scroll-btn"
                                    onClick={scrollToBottom}
                                    title="Aller en bas"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}

                            <div className="ai-chat-input-area">
                                <div className="input-wrapper">
                                    <textarea
                                        ref={aiInputRef}
                                        value={aiInputMessage}
                                        onChange={(e) => setAiInputMessage(e.target.value)}
                                        onKeyPress={handleAiKeyPress}
                                        placeholder="Écrivez votre message à l'IA..."
                                        className="chat-input"
                                        rows="1"
                                        disabled={isAiLoading}
                                    />
                                    <button
                                        onClick={handleSendAiMessage}
                                        disabled={!aiInputMessage.trim() || isAiLoading}
                                        className="send-button"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Chat View */}
                {activeTab === 'users' && (
                    <div className={`user-chat-layout ${selectedContact ? 'mobile-chat-active' : 'mobile-list-active'}`}>
                        {/* Sidebar: Active Chats List */}
                        <div className="contacts-sidebar">
                            <div className="sidebar-profile-section">
                                <div className="current-user-card">
                                    <div className="contact-avatar my-avatar">
                                        {controleur?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-name">{controleur?.username} <span className="me-label">Moi</span></div>
                                        <div className="contact-role">Connecté en tant que {translateRole(controleur?.role) || 'Utilisateur'}</div>

                                        <div className="visibility-control">
                                            <span className="visibility-label">
                                                {controleur?.isHidden ? "Invisible" : "Visible"}
                                            </span>
                                            <label className="switch small">
                                                <input
                                                    type="checkbox"
                                                    checked={!controleur?.isHidden}
                                                    onChange={toggleVisibility}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                            <button
                                                className="visibility-hint-btn"
                                                onClick={() => setShowVisibilityInfo(true)}
                                                title="Pourquoi me masquer ?"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="add-contact-trigger"
                                    onClick={() => setShowUserSearch(!showUserSearch)}
                                    title="Nouvelle discussion"
                                >
                                    {showUserSearch ? (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <span>{showUserSearch ? 'Fermer' : 'Nouveau Chat'}</span>
                                </button>
                            </div>

                            <div className="sidebar-divider"></div>

                            {showUserSearch ? (
                                <div className="contacts-list search-active">
                                    <div className="search-input-container">
                                        <input
                                            type="text"
                                            placeholder="Rechercher un utilisateur..."
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <h3 className="section-subtitle">Tous les utilisateurs</h3>
                                    {filteredSearchUsers.length > 0 ? (
                                        filteredSearchUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className="contact-item"
                                                onClick={() => handleAddContact(user)}
                                            >
                                                <div className="contact-avatar">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="contact-info">
                                                    <div className="contact-name">{user.username}</div>
                                                    <div className="contact-role">{translateRole(user.role)}</div>
                                                </div>
                                                <div className="add-indicator">
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">Aucun utilisateur trouvé</div>
                                    )}
                                </div>
                            ) : (
                                <div className="contacts-list">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 className="section-subtitle" style={{ margin: 0 }}>Conversations</h3>
                                        {unreadMessages.length > 0 && (
                                            <button
                                                className="mark-all-read-btn-chat"
                                                onClick={clearAllMessages}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '4px 8px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Tout marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                    {activeContacts.length > 0 ? (
                                        activeContacts.map(user => (
                                            <div
                                                key={user.id}
                                                className={`contact-item ${selectedContact?.id === user.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedContact(user);
                                                    markAsRead(user.id);
                                                }}
                                            >
                                                <div className="contact-avatar">
                                                    {user.username.charAt(0).toUpperCase()}
                                                    {unreadCounts[user.id] > 0 && (
                                                        <span className="unread-badge">{unreadCounts[user.id]}</span>
                                                    )}
                                                </div>
                                                <div className="contact-info">
                                                    <div className="contact-name">{user.username}</div>
                                                    <div className="contact-role">{translateRole(user.role)}</div>
                                                </div>
                                                <button
                                                    className="delete-conversation-btn"
                                                    onClick={(e) => handleDeleteConversation(e, user.id)}
                                                    title="Supprimer la conversation"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-contacts">
                                            <p>Aucune discussion active</p>
                                            <button onClick={() => setShowUserSearch(true)}>Commencer à discuter</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chat Area */}
                        <div className="user-chat-main">
                            {selectedContact ? (
                                <>
                                    <div className="user-chat-header-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button className="mobile-back-btn" onClick={() => setSelectedContact(null)}>
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <span>Discussion avec <strong>{selectedContact.username}</strong></span>
                                    </div>
                                    <div
                                        className="user-chat-messages"
                                        ref={chatContainerRef}
                                        onScroll={handleScroll}
                                    >
                                        <div className="messages-inner">
                                            {userMessages.map((msg) => {
                                                const isMyMessage = msg.senderId === controleur?.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`message-wrapper ${isMyMessage ? 'user-message' : 'assistant-message'}`}
                                                    >
                                                        <div className="message-bubble">
                                                            {!isMyMessage && (
                                                                <div className="message-avatar text-avatar">
                                                                    {msg.sender?.username?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="message-content-wrapper">
                                                                <div className="message-sender-name">
                                                                    {msg.sender?.username || 'Utilisateur'}
                                                                </div>
                                                                <div className="message-content">
                                                                    {msg.content && (
                                                                        <div className="markdown-container">
                                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                                {msg.content}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    )}
                                                                    {msg.imageUrl && (
                                                                        <div 
                                                                            className="message-image-container" 
                                                                            style={{ marginTop: '5px', marginBottom: '5px', cursor: 'zoom-in' }}
                                                                            onClick={() => setSelectedImage(msg.imageUrl.startsWith('data:') ? msg.imageUrl : `${API_BASE}${msg.imageUrl}`)}
                                                                        >
                                                                            <img src={msg.imageUrl.startsWith('data:') ? msg.imageUrl : `${API_BASE}${msg.imageUrl}`} alt="Pièce jointe" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'contain' }} />
                                                                        </div>
                                                                    )}
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                                                            className="delete-msg-btn"
                                                                            title="Supprimer"
                                                                        >
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={userMessagesEndRef} />
                                        </div>
                                    </div>

                                    {/* Sticky Scroll Button */}
                                    {showScrollBtn && (
                                        <button
                                            className="sticky-scroll-btn"
                                            onClick={scrollToBottom}
                                            title="Aller en bas"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}

                                    <div className="ai-chat-input-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                        {imageAttachment && (
                                            <div className="image-preview-wrapper" style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start', margin: '0 0 10px 10px' }}>
                                                <img src={imageAttachment} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                                <button
                                                    onClick={() => setImageAttachment(null)}
                                                    style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#d80000', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                                    title="Supprimer"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                                            <button
                                                className="attach-button"
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Joindre une image"
                                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                            <textarea
                                                ref={userInputRef}
                                                value={userInputMessage}
                                                onChange={(e) => setUserInputMessage(e.target.value)}
                                                onKeyPress={handleUserKeyPress}
                                                placeholder={`Message à ${selectedContact.username}...`}
                                                className="chat-input"
                                                rows="1"
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                onClick={handleSendUserMessage}
                                                disabled={!userInputMessage.trim() && !imageAttachment}
                                                className="send-button"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="no-contact-selected">
                                    <div className="empty-state-icon">💬</div>
                                    <p>Sélectionnez un utilisateur pour commencer à discuter</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showErrorModal && (
                <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-x-btn" onClick={() => setShowErrorModal(false)}>
                            &times;
                        </button>
                        <span className="modal-icon">⚠️</span>
                        <p className="modal-text">
                            L'AI locale est actuellement indisponible. Veuillez réessayer plus tard ou contacter DEV@TTRANSFO.COM
                        </p>
                    </div>
                </div>
            )}

            {/* Visibility Info Modal */}
            {showVisibilityInfo && (
                <div className="modal-overlay" onClick={() => setShowVisibilityInfo(false)}>
                    <div className="modal-content info-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-x-btn" onClick={() => setShowVisibilityInfo(false)}>×</button>
                        <div className="modal-icon">ℹ️</div>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Information de visibilité</h3>
                        <p className="modal-text" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                            En vous rendant <strong>Invisible</strong> :
                        </p>
                        <ul className="info-list" style={{ textAlign: 'left', color: 'rgba(255,255,255,0.8)', paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                            <li style={{ marginBottom: '8px' }}>Personne ne pourra voir votre profil dans la liste des utilisateurs.</li>
                            <li style={{ marginBottom: '8px' }}>Aucun nouvel utilisateur ne pourra commencer une discussion avec vous.</li>
                            <li style={{ marginBottom: '8px' }}>Les personnes avec qui vous avez déjà un chat pourront continuer à vous écrire.</li>
                        </ul>
                        <button
                            className="btn-save"
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                background: 'var(--accent-gradient)',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowVisibilityInfo(false)}
                        >
                            J'ai compris
                        </button>
                    </div>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)} style={{ zIndex: 3000, background: 'rgba(0,0,0,0.9)' }}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '95vw', maxHeight: '95vh' }}>
                        <button 
                            className="modal-x-btn" 
                            onClick={() => setSelectedImage(null)}
                            style={{ top: '-40px', right: '0', fontSize: '30px' }}
                        >
                            &times;
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Zoom" 
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChatPage;
