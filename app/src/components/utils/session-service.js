
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

export const useSession = () => {
  const { controleur, login, logout, loading, refreshing, updateControleur, refreshControleur } = useContext(AuthContext);

  return {
    controleur,
    isAuthenticated: !!controleur,
    sessionStart: login,
    sessionDestroy: logout,
    loading,
    refreshing,
    updateControleur,
    refreshControleur
  };
};
