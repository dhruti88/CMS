// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }
  console.log("Calling protected route");
  return user ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;