import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          {/* Puedes agregar ruta para vendedoras */}
          <Route path="/volantes" element={<div>Vendedora: Volantes</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente para proteger la ruta de admin
function AdminRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />; // no logueado
  if (user.role !== "admin") return <Navigate to="/volantes" replace />; // no es admin
  return children;
}

export default App;
