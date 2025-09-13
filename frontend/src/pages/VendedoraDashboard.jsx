import React, { useContext, useState, useEffect } from "react";
import { FaPrint, FaFileAlt, FaSun, FaMoon } from "react-icons/fa";
import axios from "axios";
import VendedoraVolantes from "./VendedoraVolantes";
import VendedoraDeudas from "./VendedoraDeudas";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [limits, setLimits] = useState({});
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  const [cantidadVolantes, setCantidadVolantes] = useState(0);
  const [totalHoy, setTotalHoy] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [deudas, setDeudas] = useState([]);
  const [loadingDeudas, setLoadingDeudas] = useState(true);

  // Aplicar dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Traer límites
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await axios.get("http://localhost:8000/config_helper/limits");
        setLimits(res.data);
      } catch (err) {
        console.error("Error fetching limits:", err);
      }
    };
    fetchLimits();
  }, []);

  const {
    diario: LIMITE_DIARIO = 30,
    semanal: LIMITE_SEMANAL = 120,
    costoExcedente: COSTO_EXTRA = 0.5,
  } = limits;

  const excesoDiario = Math.max(totalHoy - LIMITE_DIARIO, 0);
  const excesoSemanal = Math.max(totalSemana - LIMITE_SEMANAL, 0);
  const totalExceso = (excesoDiario + excesoSemanal) * COSTO_EXTRA;

  // 🔹 Traer deudas
  const fetchDeudas = async () => {
    if (!user?.id) return;
    setLoadingDeudas(true);
    try {
      const res = await axios.get(`http://localhost:8000/deudas/deudas/${user.id}`);
      console.log("Deudas backend:", res.data);
      setDeudas(Array.isArray(res.data.deudas) ? res.data.deudas : []);
    } catch (err) {
      console.error("Error cargando deudas:", err);
      setDeudas([]);
    } finally {
      setLoadingDeudas(false);
    }
  };

  useEffect(() => {
    fetchDeudas();
  }, [user]);

  // 🔹 Registrar pago
  const registrarPago = async (payload) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/deudas/registrar-pago",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      await fetchDeudas();
      return data;
    } catch (error) {
      console.error("Error registrando pago:", error);
      throw error;
    }
  };

  // 🔹 Confirmar impresión y generar deuda
  const handleConfirmarImpresion = async () => {
    if (totalExceso <= 0 || !user?.id) return;

    try {
      await axios.post("http://localhost:8000/deudas/crear-exceso", {
        usuario_id: user.id,
        monto: totalExceso,
        tipo: "diaria",
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
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MegaPrint</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{user.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800 dark:text-white" />}
          </button>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

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
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center gap-4">
          <FaPrint className="text-4xl text-blue-500" />
          <div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Volantes disponibles</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{cantidadVolantes}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center gap-4">
          <FaFileAlt className="text-4xl text-yellow-500" />
          <div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Pagos pendientes</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{deudas.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 text-center">
          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Costo por página extra</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">${COSTO_EXTRA.toFixed(2)}</p>
        </div>
      </main>

      {/* Volantes */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <VendedoraVolantes
          darkMode={darkMode}
          setCantidadVolantes={setCantidadVolantes}
          setTotalHoy={setTotalHoy}
          setTotalSemana={setTotalSemana}
          limits={{ diario: LIMITE_DIARIO, semanal: LIMITE_SEMANAL, costoExcedente: COSTO_EXTRA }}
          onConfirmarImpresion={handleConfirmarImpresion}
        />
      </section>

      {/* Deudas */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <VendedoraDeudas deudas={deudas} onRegistrarPago={registrarPago} loading={loadingDeudas} />
      </section>
    </div>
  );
}
