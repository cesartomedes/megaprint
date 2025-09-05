import React from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraRoute({ children }) {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    // No logueada → ir al login
    return <Navigate to="/" replace />;
  }

  if (user.role !== "vendedora") {
    // No es vendedora → redirigir a home o volantes
    return <Navigate to="/volantes" replace />;
  }

  if (user.status !== "approved") {
    // Cuenta no aprobada → mostrar mensaje o redirigir
    return <Navigate to="/volantes" replace />;
  }

  return children;
}
