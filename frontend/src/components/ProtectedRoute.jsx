import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/auth';

const ProtectedRoute = () => {
  const token = authService.getToken();

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizar las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
