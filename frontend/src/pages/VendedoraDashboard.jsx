import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPrint, FaDollarSign, FaFileAlt, FaSun, FaMoon } from "react-icons/fa";
import VendedoraVolantes from "./VendedoraVolantes"; // <-- importamos el componente

export default function VendedoraDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  // Cambiar clase dark en html
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Para mostrar la cantidad de volantes, podemos usar un estado temporal
  const [cantidadVolantes, setCantidadVolantes] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MegaPrint
          </h1>
          {user && <p className="text-gray-600 dark:text-gray-300 mt-1">{user.username}</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle Dark/Light */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800 dark:text-white" />}
          </button>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Stats */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-4 transition-colors duration-300">
          <FaPrint className="text-4xl text-blue-500" />
          <div>
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">Volantes disponibles</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{cantidadVolantes}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-4 transition-colors duration-300">
          <FaDollarSign className="text-4xl text-green-500" />
          <div>
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">Ventas realizadas</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$3,450</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-4 transition-colors duration-300">
          <FaFileAlt className="text-4xl text-yellow-500" />
          <div>
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">Pagos pendientes</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
          </div>
        </div>
      </main>

      {/* Sección Volantes */}
      <section className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
          <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-4">Últimos volantes subidos</h2>
          <VendedoraVolantes setCantidadVolantes={setCantidadVolantes} />
        </div>
      </section>
    </div>
  );
}
