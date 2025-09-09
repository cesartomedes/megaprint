// VendedoraDashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import {
  FaPrint,

  FaFileAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import VendedoraVolantes from "./VendedoraVolantes";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  const [cantidadVolantes, setCantidadVolantes] = useState(0);
  const [totalHoy, setTotalHoy] = useState(
    () => parseInt(localStorage.getItem("totalHoy")) || 0
  );
  const [totalSemana, setTotalSemana] = useState(
    () => parseInt(localStorage.getItem("totalSemana")) || 0
  );
  const [costoExtra, setCostoExtra] = useState(0);
  const [historial, setHistorial] = useState([]);

  const limiteDiario = 30;
  const limiteSemanal = 120;
  const costoPorPaginaExtra = 0.5;

  // Guardamos darkMode en localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Guardar totalHoy y totalSemana en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("totalHoy", totalHoy);
  }, [totalHoy]);

  useEffect(() => {
    localStorage.setItem("totalSemana", totalSemana);
  }, [totalSemana]);

  const excesoDiario = Math.max(totalHoy - limiteDiario, 0);
  const excesoSemanal = Math.max(totalSemana - limiteSemanal, 0);

  // Actualizamos el costo extra en base a excesos
  useEffect(() => {
    setCostoExtra((excesoDiario + excesoSemanal) * costoPorPaginaExtra);
  }, [excesoDiario, excesoSemanal]);

  const confirmarImpresion = () => {
    if (totalHoy === 0) return;
    const nuevaEntrada = {
      fecha: new Date().toLocaleString(),
      cantidad: totalHoy,
    };
    setHistorial((prev) => [nuevaEntrada, ...prev]);
    setTotalHoy(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MegaPrint
          </h1>
          {user && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.username}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-800 dark:text-white" />
            )}
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
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
              Volantes disponibles
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {cantidadVolantes}
            </p>
          </div>
        </div>

        {/* <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-4 transition-colors duration-300">
          <FaDollarSign className="text-4xl text-green-500" />
          <div>
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
              Ventas realizadas
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              $3,450
            </p>
          </div>
        </div> */}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-4 transition-colors duration-300">
          <FaFileAlt className="text-4xl text-yellow-500" />
          <div>
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
              Pagos pendientes
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              2
            </p>
          </div>
        </div>
      </main>

      {/* Límites y costo exceso */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300 ${excesoDiario > 0 ? "border-red-500 border-2" : ""}`}>
          <p className="font-semibold text-lg text-gray-700 dark:text-white">Límite Diario</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalHoy} / {limiteDiario} ({((totalHoy / limiteDiario) * 100).toFixed(1)}%)
          </p>
          {totalHoy >= limiteDiario * 0.8 && totalHoy < limiteDiario && (
            <p className="text-yellow-500 dark:text-yellow-400 mt-2 font-semibold">
              Te faltan {limiteDiario - totalHoy} impresiones para el límite diario
            </p>
          )}
          {excesoDiario > 0 && (
            <p className="text-red-500 dark:text-red-400 mt-2 font-semibold">
              ¡Has alcanzado el límite diario! Costo extra: ${excesoDiario * costoPorPaginaExtra}
            </p>
          )}
        </div>

        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300 ${excesoSemanal > 0 ? "border-red-500 border-2" : ""}`}>
          <p className="font-semibold text-lg text-gray-700 dark:text-white">Límite Semanal</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalSemana} / {limiteSemanal} ({((totalSemana / limiteSemanal) * 100).toFixed(1)}%)
          </p>
          {totalSemana >= limiteSemanal * 0.8 && totalSemana < limiteSemanal && (
            <p className="text-yellow-500 dark:text-yellow-400 mt-2 font-semibold">
              Te faltan {limiteSemanal - totalSemana} impresiones para el límite semanal
            </p>
          )}
          {excesoSemanal > 0 && (
            <p className="text-red-500 dark:text-red-400 mt-2 font-semibold">
              ¡Has alcanzado el límite semanal! Costo extra: ${excesoSemanal * costoPorPaginaExtra}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300">
          <p className="font-semibold text-lg text-gray-700 dark:text-white">Costo por página extra</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${costoExtra.toFixed(2)}</p>
        </div>
      </section>

      {/* Alertas */}
      <section className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 transition-colors duration-300">
          <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Alertas</h2>
          <div className="flex flex-col gap-2">
            {totalHoy >= limiteDiario * 0.8 && totalHoy < limiteDiario && (
              <div className="p-2 bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-100 rounded">
                Te faltan {limiteDiario - totalHoy} impresiones para completar el límite diario
              </div>
            )}
            {totalHoy >= limiteDiario && (
              <div className="p-2 bg-red-500 text-white rounded">
                ¡Has alcanzado el límite diario!
              </div>
            )}
            {totalSemana >= limiteSemanal * 0.8 && totalSemana < limiteSemanal && (
              <div className="p-2 bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-100 rounded">
                Te faltan {limiteSemanal - totalSemana} impresiones para el límite semanal
              </div>
            )}
            {totalSemana >= limiteSemanal && (
              <div className="p-2 bg-red-500 text-white rounded">
                ¡Has alcanzado el límite semanal!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección Volantes */}
      <section className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
          <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-4">
            Últimos volantes subidos
          </h2>
          <VendedoraVolantes
            setCantidadVolantes={setCantidadVolantes}
            setTotalHoy={setTotalHoy}
            setTotalSemana={setTotalSemana}
            setCostoExtra={setCostoExtra} // ahora se usa
          />
          <button
            onClick={confirmarImpresion}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Confirmar impresión
          </button>
        </div>
      </section>

      {/* Historial simulado */}
      <section className="p-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
          <h2 className="text-gray-700 dark:text-gray-200 font-semibold mb-4">
            Historial de impresiones
          </h2>
          {historial.length === 0 && <p>No hay impresiones confirmadas todavía.</p>}
          <ul className="space-y-2">
            {historial.map((item, index) => (
              <li key={index} className="p-2 border rounded flex justify-between">
                <span>{item.fecha}</span>
                <span className="font-bold">{item.cantidad} impresiones</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
