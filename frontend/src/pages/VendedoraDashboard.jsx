import React, { useContext, useState, useEffect, useCallback } from "react";
import { FaPrint, FaFileAlt, FaSun, FaMoon, FaBell } from "react-icons/fa";
import axios from "axios";
import VendedoraVolantes from "./VendedoraVolantes";
import VendedoraDeudas from "./VendedoraDeudas";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraDashboard() {
  const { user, logout } = useContext(AuthContext);

  // Estados
  const [limits, setLimits] = useState({});
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );

  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [cantidadVolantes, setCantidadVolantes] = useState(0);
  const [totalHoy, setTotalHoy] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [deudas, setDeudas] = useState([]);
  const [loadingDeudas, setLoadingDeudas] = useState(true);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Traer límites desde backend
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/config_helper/limits",
        );
        setLimits(res.data);
      } catch (err) {
        console.error("Error fetching limits:", err);
      }
    };
    fetchLimits();
  }, []);

  // Extraer límites con fallback
  const {
    diario: LIMITE_DIARIO = 30,
    semanal: LIMITE_SEMANAL = 120,
    costoExcedente: COSTO_EXTRA = 0.5,
  } = limits;

  // Cálculos de exceso
  const excesoDiario = Math.max(totalHoy - LIMITE_DIARIO, 0);
  const excesoSemanal = Math.max(totalSemana - LIMITE_SEMANAL, 0);
  const totalExceso = (excesoDiario + excesoSemanal) * COSTO_EXTRA;

  // 🔹 Traer deudas
  const fetchDeudas = useCallback(async () => {
    if (!user?.id) return;
    setLoadingDeudas(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/deudas/deudas/${user.id}`,
      );
      setDeudas(Array.isArray(res.data.deudas) ? res.data.deudas : []);
    } catch (err) {
      console.error("Error cargando deudas:", err);
      setDeudas([]);
    } finally {
      setLoadingDeudas(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDeudas();
  }, [fetchDeudas]);

  // 🔹 Traer notificaciones
  const fetchNotificacionesVendedora = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(
        `http://localhost:8000/notificaciones/${user.id}`,
      );
      setNotificaciones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al traer notificaciones:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotificacionesVendedora();
    const interval = setInterval(fetchNotificacionesVendedora, 10000); // cada 10s
    return () => clearInterval(interval);
  }, [fetchNotificacionesVendedora]);

  const marcarNotificacionLeida = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/notificaciones/${id}/leer`);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true } : n)),
      );
    } catch (err) {
      console.error("Error marcar leida:", err);
    }
  };

  // 🔹 Registrar pago (subir capture)
  const registrarPago = async (payload) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/deudas/registrar-pago",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      await fetchDeudas();
      return data;
    } catch (error) {
      console.error("Error registrando pago:", error);
      throw error;
    }
  };

  // 🔹 Confirmar impresión (si genera exceso → crear deuda)
  const handleConfirmarImpresion = async () => {
    if (totalExceso <= 0 || !user?.id) return;

    try {
      await axios.post("http://localhost:8000/deudas/crear-exceso", {
        usuario_id: user.id,
        monto: totalExceso,
        tipo: excesoDiario > 0 ? "diaria" : "semanal",
      });
      await fetchDeudas();
    } catch (err) {
      console.error("Error creando deuda por exceso:", err);
    }
  };

  if (!user) return <p>Cargando usuario...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo y usuario */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MegaPrint
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{user.username}</p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end relative">
          {/* 🔔 Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              <FaBell className="text-gray-800 dark:text-white" />
              {notificaciones.some((n) => !n.leido) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900"></span>
              )}
            </button>

            {/* Dropdown normal en desktop */}
            <div
              className={`hidden md:block absolute right-0 mt-3 w-72 sm:w-80 md:w-96 bg-white dark:bg-gray-900 shadow-xl rounded-2xl max-h-96 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                showNotifs ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              {notificaciones.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                  No tienes notificaciones
                </p>
              ) : (
                notificaciones.map((n) => (
                  <div
                    key={n.id}
                    className={`m-2 p-3 rounded-xl shadow-sm dark:shadow-gray-800 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      n.leido
                        ? "bg-gray-50 dark:bg-gray-800 opacity-70"
                        : "bg-red-50 dark:bg-red-900 font-semibold"
                    }`}
                    onClick={() => marcarNotificacionLeida(n.id)}
                  >
                    <p className="text-gray-800 dark:text-gray-200">
                      {n.mensaje}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(n.fecha).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Drawer lateral para móviles */}
            <div
              className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${
                showNotifs ? "translate-x-0" : "-translate-x-full"
              } md:hidden`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  Notificaciones
                </h2>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-gray-600 dark:text-gray-400 font-bold"
                >
                  X
                </button>
              </div>
              <div className="overflow-y-auto max-h-full p-2">
                {notificaciones.length === 0 ? (
                  <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                    No tienes notificaciones
                  </p>
                ) : (
                  notificaciones.map((n) => (
                    <div
                      key={n.id}
                      className={`m-2 p-3 rounded-xl shadow-sm dark:shadow-gray-800 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        n.leido
                          ? "bg-gray-50 dark:bg-gray-800 opacity-70"
                          : "bg-red-50 dark:bg-red-900 font-semibold"
                      }`}
                      onClick={() => marcarNotificacionLeida(n.id)}
                    >
                      <p className="text-gray-800 dark:text-gray-200">
                        {n.mensaje}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(n.fecha).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-800 dark:text-white" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Metrics */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center gap-4">
          <FaPrint className="text-4xl text-blue-500" />
          <div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Volantes disponibles
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {cantidadVolantes}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center gap-4">
          <FaFileAlt className="text-4xl text-yellow-500" />
          <div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Pagos pendientes
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {deudas.length}
            </p>
          </div>
        </div>
      </main>

      {/* Alerts */}
      {totalHoy >= LIMITE_DIARIO && (
        <div className="p-4 bg-red-600 text-white font-bold text-center shadow-md rounded-lg mb-4">
          ⚠️ YA CONSUMISTE TUS {LIMITE_DIARIO} IMPRESIONES GRATIS ⚠️
        </div>
      )}
      {totalExceso > 0 && (
        <div className="p-4 bg-red-500 text-white font-bold text-center shadow-md rounded-lg mb-4">
          Costo extra: ${totalExceso.toFixed(2)}
        </div>
      )}

      {/* Metrics */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300 ${
            excesoDiario > 0 ? "border-red-500 border-2" : ""
          }`}
        >
          <p className="font-semibold text-lg text-gray-700 dark:text-white">
            Límite Diario
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalHoy} / {LIMITE_DIARIO} (
            {((totalHoy / LIMITE_DIARIO) * 100).toFixed(1)}%)
          </p>
          {totalHoy >= LIMITE_DIARIO * 0.8 && totalHoy < LIMITE_DIARIO && (
            <p className="text-yellow-500 dark:text-yellow-400 mt-2 font-semibold">
              Te faltan {LIMITE_DIARIO - totalHoy} impresiones para el límite
              diario
            </p>
          )}
          {excesoDiario > 0 && (
            <p className="text-red-500 dark:text-red-400 mt-2 font-semibold">
              ¡Has alcanzado el límite diario! Costo extra: $
              {excesoDiario * COSTO_EXTRA}
            </p>
          )}
        </div>

        <div
          className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300 ${
            excesoSemanal > 0 ? "border-red-500 border-2" : ""
          }`}
        >
          <p className="font-semibold text-lg text-gray-700 dark:text-white">
            Límite Semanal
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalSemana} / {LIMITE_SEMANAL} (
            {((totalSemana / LIMITE_SEMANAL) * 100).toFixed(1)}%)
          </p>
          {totalSemana >= LIMITE_SEMANAL * 0.8 &&
            totalSemana < LIMITE_SEMANAL && (
              <p className="text-yellow-500 dark:text-yellow-400 mt-2 font-semibold">
                Te faltan {LIMITE_SEMANAL - totalSemana} impresiones para el
                límite semanal
              </p>
            )}
          {excesoSemanal > 0 && (
            <p className="text-red-500 dark:text-red-400 mt-2 font-semibold">
              ¡Has alcanzado el límite semanal! Costo extra: $
              {excesoSemanal * COSTO_EXTRA}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col items-center justify-center transition-colors duration-300">
          <p className="font-semibold text-lg text-gray-700 dark:text-white">
            Costo por página extra
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${COSTO_EXTRA.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Volantes */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <VendedoraVolantes
          darkMode={darkMode}
          setCantidadVolantes={setCantidadVolantes}
          setTotalHoy={setTotalHoy}
          setTotalSemana={setTotalSemana}
          limits={{
            diario: LIMITE_DIARIO,
            semanal: LIMITE_SEMANAL,
            costoExcedente: COSTO_EXTRA,
          }}
          onConfirmarImpresion={async () => {
            await handleConfirmarImpresion();
            await fetchDeudas(); // 🔹 Refrescamos deudas en tiempo real
          }}
        />
      </section>

      {/* Deudas */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <VendedoraDeudas
          deudas={deudas}
          onRegistrarPago={registrarPago}
          loading={loadingDeudas}
        />
      </section>
    </div>
  );
}
