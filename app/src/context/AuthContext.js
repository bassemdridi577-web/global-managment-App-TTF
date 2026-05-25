
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { setAuthHeaders, getMe } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [controleur, setControleur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const login = (userData, token) => {
    setControleur(userData);
    localStorage.setItem('controleur', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
    setAuthHeaders(userData, token);
  };

  const logout = () => {
    setControleur(null);
    localStorage.removeItem('controleur');
    localStorage.removeItem('token');
    setAuthHeaders(null, null);
  };

  const updateControleur = (updatedUser) => {
    setControleur(updatedUser);
    localStorage.setItem('controleur', JSON.stringify(updatedUser));
    const token = localStorage.getItem('token');
    setAuthHeaders(updatedUser, token);
  };

  const refreshControleur = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getMe();
      updateControleur(response.data);
    } catch (error) {
      console.error("Failed to refresh user data", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    const loadUser = async () => {
      const storedUser = localStorage.getItem('controleur');
      const token = localStorage.getItem('token');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setControleur(user);
        setAuthHeaders(user, token);
        await refreshControleur();
      } else {
        // Portfolio Auto-login
        const mockUser = {
          id: 1,
          username: 'Guest_Admin',
          role: 'admin',
          name: 'Portfolio Guest'
        };
        console.log('Portfolio mode: Auto-logging as admin');
        login(mockUser, 'mock-token');
      }
      setLoading(false);
    };

    loadUser();

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [refreshControleur]);

  return (
    <AuthContext.Provider value={{
      controleur,
      login,
      logout,
      loading,
      refreshing,
      updateControleur,
      refreshControleur
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
