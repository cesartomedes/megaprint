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

  // helper para mostrar mensajes temporales
  const showMessage = (msg) => {
    console.log("Mensaje mostrado:", msg); // 👈 log para depuración
    setServerMessage(msg);
    setTimeout(() => setServerMessage(""), 5000); // 5 segundos
  };

  // LOGIN
  const login = async (data) => {
    try {
      setServerMessage(""); // limpiar mensajes previos
      const json = await loginUser({
        username: data.username,
        password: data.password,
      });

      console.log("Respuesta del backend login:", json);
      const userData = {
        id: json.id, 
        username: json.username, 
        role: json.role,
        status: json.status,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      if (json.role === "admin") {
        navigate("/dashboard");
      } else if (json.role === "vendedora") {
        // Manejo de estados exactos del backend
        switch (json.status) {
          case "aprobada":
            console.log("➡️ Navegando a /vendedora/dashboard");
            navigate("/vendedora/dashboard");
            break;
          case "pendiente":
            showMessage("❌ Tu cuenta está pendiente de aprobación");
            break;
          case "rechazada":
            showMessage("❌ Tu cuenta fue rechazada");
            break;
          default:
            showMessage("❌ Estado de cuenta desconocido");
        }
      }
    } catch (err) {
      showMessage(`❌ Error en login: ${err.message}`);
    }
  };

  // REGISTER
  const registerUser = async (data) => {
    try {
      setServerMessage(""); // limpiar mensajes previos
      const json = await apiRegisterUser({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      });

      console.log("Respuesta del backend registro:", json);

      const userData = {
        username: json.nombre,
        role: json.role || "vendedora",
        status: json.status ?? "pendiente",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.status === "aprobada") {
        showMessage(
          "✅ Registro exitoso. Tu cuenta fue aprobada automáticamente.",
        );
        navigate("/vendedora/dashboard");
      } else if (userData.status === "pendiente") {
        showMessage(
          "✅ Registro exitoso. Tu cuenta está pendiente de aprobación.",
        );
        navigate("/");
      } else if (userData.status === "rechazada") {
        showMessage("❌ Tu cuenta fue rechazada");
        navigate("/");
      } else {
        showMessage("❌ Estado de cuenta desconocido");
        navigate("/");
      }
    } catch (err) {
      showMessage(`❌ ${err.message}`);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setServerMessage(""); // limpiar mensaje al salir
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, registerUser, logout, serverMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}
