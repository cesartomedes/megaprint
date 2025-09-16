import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Printer } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transition-all duration-500">
        {/* Logo / Icon */}
        <div className="flex flex-col items-center mb-6">
          <Printer className="w-16 h-16 text-blue-600" />
          <h1 className="text-2xl font-bold mt-2">MegaPrint</h1>
          <p className="text-gray-500 text-sm">
            Sistema de gestión de impresiones
          </p>
        </div>

        {/* Switch Login / Registro */}
        <div className="flex mb-6 border rounded-full overflow-hidden">
          <button
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              isLogin ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              !isLogin ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        {isLogin ? <LoginForm /> : <RegisterForm setIsLogin={setIsLogin} />}
      </div>
    </div>
  );
}

// ------------------- Login -------------------
function LoginForm() {
  const { login, serverMessage } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login({ username: data.nombre, password: data.password });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Nombre de usuario"
        {...register("nombre", { required: "El nombre es obligatorio" })}
        className={`border p-2 rounded ${errors.nombre ? "border-red-500" : ""}`}
      />
      {errors.nombre && (
        <span className="text-red-500 text-xs">{errors.nombre.message}</span>
      )}

      <input
        type="password"
        placeholder="Contraseña"
        {...register("password", { required: "La contraseña es obligatoria" })}
        className={`border p-2 rounded ${errors.password ? "border-red-500" : ""}`}
      />
      {errors.password && (
        <span className="text-red-500 text-xs">{errors.password.message}</span>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {serverMessage && <p className="text-sm mt-2">{serverMessage}</p>}
    </form>
  );
}

// ------------------- Registro -------------------
function RegisterForm({ setIsLogin }) {
  const { registerUser, serverMessage, logout } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      });

      // Limpiar sesión actual si hay algo
      logout(); // <-- función de AuthContext para cerrar sesión

      // Mostrar alerta y volver al login
      alert("Registro exitoso. En espera de ser aprobado.");
      setIsLogin(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Nombre de usuario"
        {...register("nombre", {
          required: "El nombre es obligatorio",
          minLength: { value: 3, message: "Mínimo 3 caracteres" },
        })}
        className={`border p-2 rounded ${errors.nombre ? "border-red-500" : ""}`}
      />
      {errors.nombre && (
        <span className="text-red-500 text-xs">{errors.nombre.message}</span>
      )}

      <input
        type="email"
        placeholder="Correo electrónico"
        {...register("email", {
          required: "El correo es obligatorio",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Correo inválido" },
        })}
        className={`border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
      />
      {errors.email && (
        <span className="text-red-500 text-xs">{errors.email.message}</span>
      )}

      <input
        type="password"
        placeholder="Contraseña"
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: { value: 4, message: "Mínimo 4 caracteres" },
        })}
        className={`border p-2 rounded ${errors.password ? "border-red-500" : ""}`}
      />
      {errors.password && (
        <span className="text-red-500 text-xs">{errors.password.message}</span>
      )}

      <ul className="text-xs text-gray-500 list-disc pl-5">
        <li>No necesitas verificar tu correo electrónico</li>
        <li>Tu cuenta quedará pendiente de aprobación por un administrador</li>
        <li>Los nuevos usuarios son registrados como Vendedora por defecto</li>
      </ul>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear Cuenta"}
      </button>

      {serverMessage && <p className="text-sm mt-2">{serverMessage}</p>}
    </form>
  );
}
