import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    // Rediriger vers le dashboard si l'utilisateur n'est pas admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
