import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import AdminDashboard from "./components/AdminDashboard";
import VendedoraDashboard from "./pages/VendedoraDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthForm />} />

          {/* Admin */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Vendedora */}
          <Route
            path="/vendedora/dashboard"
            element={
              <VendedoraRoute>
                <VendedoraDashboard />
              </VendedoraRoute>
            }
          />

          {/* Ruta temporal para vendedoras pendientes o rechazadas */}
          <Route path="/volantes" element={<div>Vendedora: Volantes</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente para proteger ruta de admin
function AdminRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />; // no logueado
  if (user.role !== "admin") return <Navigate to="/" replace />; // no es admin
  return children;
}

// Componente para proteger ruta de vendedora aprobada
function VendedoraRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />; // no logueado
  if (user.role !== "vendedora") return <Navigate to="/" replace />; // no es vendedora
  if (user.status !== "aprobada") return <Navigate to="/volantes" replace />; // no aprobada
  return children;
}

export default App;
