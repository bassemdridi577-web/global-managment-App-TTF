import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './utils/session-service';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, controleur, loading, refreshing } = useSession();

  console.log('ProtectedRoute: loading', loading);
  console.log('ProtectedRoute: refreshing', refreshing);
  console.log('ProtectedRoute: isAuthenticated', isAuthenticated);
  console.log('ProtectedRoute: controleur', controleur);

  if (loading || refreshing) {
    return <div>Loading...</div>; // Or a spinner, etc.
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the acceuil page
    return <Navigate to="/acceuil" replace />;
  }

  if (roles && !roles.includes(controleur.role)) {
    // If the user's role is not in the allowed roles, redirect to an unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
