import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser as apiRegisterUser } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [serverMessage, setServerMessage] = useState("");

  // LOGIN
  const login = async (data) => {
    try {
      const json = await loginUser({
        username: data.username, // coincide con LoginRequest en backend
        password: data.password,
      });

      setUser({ username: data.username, role: json.role });
      localStorage.setItem(
        "user",
        JSON.stringify({ username: data.username, role: json.role })
      );

      if (json.role === "admin") navigate("/dashboard");
      else navigate("/volantes");
    } catch (err) {
      setServerMessage(`❌ ${err.message}`);
    }
  };

  // REGISTER
  const registerUser = async (data) => {
    try {
      const json = await apiRegisterUser({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      });

      setUser({ username: json.nombre, role: json.role || "vendedora" });
      localStorage.setItem(
        "user",
        JSON.stringify({ username: json.nombre, role: json.role || "vendedora" })
      );

      navigate("/volantes");
    } catch (err) {
      setServerMessage(`❌ ${err.message}`);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, serverMessage }}>
      {children}
    </AuthContext.Provider>
  );
}
