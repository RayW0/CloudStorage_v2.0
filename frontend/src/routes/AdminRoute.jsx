// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, customClaims, isLoading } = useAuth();

  console.log('AdminRoute - isLoading:', isLoading);
  console.log('AdminRoute - currentUser:', currentUser);
  console.log('AdminRoute - customClaims:', customClaims);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!customClaims.admin) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
}

export default AdminRoute;
