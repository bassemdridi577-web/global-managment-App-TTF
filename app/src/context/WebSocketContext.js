
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import api from '../api';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const { controleur } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> { isOnline, lastSeen, username, laboname }

    // Initial load of online users (Admin Only)
    useEffect(() => {
        if (!controleur?.id || controleur.role !== 'admin') return;
        
        const fetchPresence = async () => {
            try {
                const response = await api.get('/users/presence');
                const presenceMap = new Map();
                response.data.forEach(user => {
                    presenceMap.set(user.id, {
                        username: user.username,
                        laboname: user.laboname,
                        isOnline: user.isOnline,
                        lastSeen: user.lastSeen
                    });
                });
                setOnlineUsers(presenceMap);
            } catch (err) {
                console.error("Failed to fetch initial presence", err);
            }
        };

        fetchPresence();
    }, [controleur?.id, controleur?.role]);


    // Initial load from local storage
    useEffect(() => {
        if (controleur?.id) {
            try {
                const saved = localStorage.getItem(`unreadMessages_${controleur.id}`);
                if (saved) {
                    setUnreadMessages(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Error loading unread messages", e);
            }
            setIsLoaded(true);
        } else {
            setUnreadMessages([]);
            setIsLoaded(false);
        }
    }, [controleur?.id]);

    // Save to local storage when unreadMessages changes
    useEffect(() => {
        if (controleur?.id && isLoaded) {
            localStorage.setItem(`unreadMessages_${controleur.id}`, JSON.stringify(unreadMessages));
        }
    }, [unreadMessages, controleur?.id, isLoaded]);

    useEffect(() => {
        if (!controleur?.id) return;

        // Portfolio mode: Skip WebSocket
        const isMock = window.location.hostname.includes('github.io') || 
                       process.env.REACT_APP_MOCK_API === 'true';
        if (isMock) {
            console.log('Portfolio mode: WebSocket disabled');
            return;
        }

        let ws = null;
        let reconnectTimeout = null;
        let retryCount = 0;
        const maxRetries = 10;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Use window.location.hostname to connect to the backend on the same host
            // Use port 5000 as per backend configuration
            const hostname = window.location.hostname;
            const wsUrl = `${protocol}//${hostname}:5000?userId=${controleur.id}`;

            console.log(`Attempting WebSocket connection to: ${wsUrl}`);

            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('Global WebSocket Connected');
                setIsConnected(true);
                retryCount = 0; // Reset retry count on successful connection
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WS Message received:', data);

                    if (data.type === 'NEW_MESSAGE') {
                        // Only process notifications if we are NOT the sender
                        if (data.message.senderId !== controleur.id) {
                            setUnreadMessages(prev => [...prev, data.message]);

                            // Play a sound for notification
                            try {
                                new Audio('/assets/notification.mp3').play().catch(() => { });
                            } catch (e) {
                                // Audio play might fail if no interaction
                            }

                            // Trigger browser notification if supported
                            if (Notification.permission === "granted") {
                                new Notification(`Nouveau message de ${data.message.sender?.username || 'Utilisateur'}`, {
                                    body: data.message.content
                                });
                            } else if (Notification.permission !== "denied") {
                                Notification.requestPermission();
                            }
                        }
                    }

                    if (data.type === 'USER_PRESENCE' && controleur?.role === 'admin') {
                        setOnlineUsers(prev => {
                            const updated = new Map(prev);
                            const currentData = updated.get(data.userId) || {};
                            updated.set(data.userId, {
                                ...currentData,
                                username: data.username || currentData.username,
                                laboname: data.laboname || currentData.laboname,
                                isOnline: data.isOnline,
                                lastSeen: data.lastSeen
                            });
                            return updated;
                        });
                    }
                } catch (err) {
                    console.error('WebSocket message error:', err);
                }
            };

            ws.onclose = () => {
                console.log('Global WebSocket Disconnected');
                setIsConnected(false);
                setSocket(null);

                // Attempt reconnection with exponential backoff
                if (retryCount < maxRetries) {
                    const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Reconnecting in ${timeout}ms...`);
                    reconnectTimeout = setTimeout(() => {
                        retryCount++;
                        connect();
                    }, timeout);
                } else {
                    console.error('Max WebSocket reconnection attempts reached.');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.close(); // Trigger onclose
            };

            setSocket(ws);
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [controleur?.id]);

    const markAsRead = (senderId) => {
        if (!senderId) return;
        setUnreadMessages(prev => prev.filter(msg => String(msg.senderId) !== String(senderId)));
    };

    const clearAllMessages = () => {
        setUnreadMessages([]);
    };

    const value = {
        socket,
        isConnected,
        unreadMessages,
        markAsRead,
        clearAllMessages,
        onlineUsers,
        setOnlineUsers
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
