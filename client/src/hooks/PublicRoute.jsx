import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>; // Show loading while checking auth state
  }

  return user ? <Navigate to="/home" /> : children;
};

export default PublicRoute;
