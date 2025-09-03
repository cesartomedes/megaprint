import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (data) => {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Error de login");

    setUser({ username: data.username, role: json.role });
    localStorage.setItem("user", JSON.stringify({ username: data.username, role: json.role }));

    // Redirige según rol
    if (json.role === "admin") navigate("/dashboard");
    else navigate("/volantes");
  };

  const registerUser = async (data) => {
    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Error de registro");

    setUser({ username: data.username, role: json.role || "vendedora" });
    localStorage.setItem("user", JSON.stringify({ username: data.username, role: json.role || "vendedora" }));

    navigate("/volantes");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/"); // Redirige al login
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
