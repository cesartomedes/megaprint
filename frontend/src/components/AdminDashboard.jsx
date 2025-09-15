import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import CatalogoTab from "./catalogo/CatalogoTab";
import CategoriasTab from "./CategoriasTab";
import ImpresionesTab from "./impresiones/ImpresionesTab";
import SeguridadTab from "./SeguridadTab";
import ConfiguracionTab from "./ConfiguracionTab";
import PagosTab from "./pagos/PagosTab";
import AdminImpresiones from "./AdminImpresiones";

import {
  Printer,
  Users,
  ClipboardList,
  CreditCard,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  // Dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Métricas
  const [metrics, setMetrics] = useState([
    { title: "Vendedoras", value: 0, icon: Users, color: "bg-blue-500" },
    {
      title: "Órdenes activas",
      value: 0,
      icon: ClipboardList,
      color: "bg-green-500",
    },
    {
      title: "Pagos pendientes",
      value: 0,
      icon: CreditCard,
      color: "bg-yellow-500",
    },
    {
      title: "Ingresos del mes",
      value: "$0",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ]);

  const [activeTab, setActiveTab] = useState("vendedoras");
  const tabs = [
    { id: "vendedoras", label: "Vendedoras" },
    { id: "catalogo", label: "Catálogo" },
    { id: "categorias", label: "Categorías" },
    { id: "pagos", label: "Pagos" },
    { id: "impresion", label: "Impresión (CUPS)" },
    { id: "seguridad", label: "Seguridad" },
    { id: "configuracion", label: "Configuración" },
    { id: "admin-impresiones", label: "Historial Impresiones" },
  ];

  const [vendedoras, setVendedoras] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  useEffect(() => {
    fetchMetrics();
  }, []);
  useEffect(() => {
    if (activeTab === "vendedoras") fetchVendedoras();
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/dashboard");
      const data = res.data;
      setMetrics([
        {
          title: "Vendedoras",
          value:
            data.vendedoras.aprobadas +
            data.vendedoras.pendientes +
            data.vendedoras.rechazadas,
          icon: Users,
          color: "bg-blue-500",
        },
        {
          title: "Órdenes activas",
          value: data.ordenes_activas,
          icon: ClipboardList,
          color: "bg-green-500",
        },
        {
          title: "Pagos pendientes",
          value: data.pagos_pendientes,
          icon: CreditCard,
          color: "bg-yellow-500",
        },
        // {
        //   title: "Ingresos del mes",
        //   value: `$${data.ingresos_mes}`,
        //   icon: DollarSign,
        //   color: "bg-purple-500",
        // },
      ]);
    } catch (err) {
      console.error("Error al traer métricas:", err);
    }
  };

  const fetchVendedoras = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/vendedoras/");
      setVendedoras(res.data);
    } catch (err) {
      console.error("Error al traer vendedoras:", err);
    }
  };

  const handleActualizarEstado = async (id, estado) => {
    try {
      if (estado === "aprobada") {
        await axios.post(
          `http://127.0.0.1:8000/admin/vendedoras/${id}/aprobar`,
        );
      } else if (estado === "rechazada") {
        await axios.post(
          `http://127.0.0.1:8000/admin/vendedoras/${id}/rechazar`,
        );
      }
      fetchVendedoras();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const vendedorasFiltradas = vendedoras.filter(
    (v) => v.estado === filtroEstado,
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}

      <header className="bg-white dark:bg-gray-800 shadow flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <Printer className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            MegaPrint
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-gray-800 dark:text-white" />
            )}
          </button>
          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[120px] sm:max-w-none">
            {user?.username || "No hay usuario"}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-600 transition-colors whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Pestañas */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl mx-6 mt-6 p-4 flex gap-4 overflow-x-auto transition-colors duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeTab === "vendedoras" && (
          <VendedorasTab
            vendedoras={vendedorasFiltradas}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            handleActualizarEstado={handleActualizarEstado}
          />
        )}
        {activeTab === "catalogo" && <CatalogoTab />}
        {activeTab === "categorias" && <CategoriasTab />}
        {activeTab === "pagos" && <PagosTab />}
        {activeTab === "seguridad" && <SeguridadTab />}
        {activeTab === "configuracion" && <ConfiguracionTab />}
        {activeTab === "impresion" && <ImpresionesTab />}
        {activeTab === "admin-impresiones" && <AdminImpresiones />}
      </div>
    </div>
  );
}

// --------------------------
// COMPONENTES INTERNOS
// --------------------------

function MetricCard({ title, value, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex items-center gap-4 transition-colors duration-300">
      <div
        className={`${color} w-12 h-12 flex items-center justify-center rounded-full text-white`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-200 text-sm">{title}</h3>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function VendedorasTab({
  vendedoras,
  filtroEstado,
  setFiltroEstado,
  handleActualizarEstado,
}) {
  const colorEstado = {
    pendiente:
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
    aprobada:
      "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-400",
    rechazada: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-400",
  };

  const [modal, setModal] = useState({
    visible: false,
    vendedora: null,
    accion: null,
  });
  const abrirModal = (vendedora, accion) =>
    setModal({ visible: true, vendedora, accion });
  const cerrarModal = () =>
    setModal({ visible: false, vendedora: null, accion: null });
  const confirmarAccion = () => {
    handleActualizarEstado(modal.vendedora.id, modal.accion);
    cerrarModal();
  };

  return (
    <div>
      {/* Filtro */}
      <div className="mb-4 flex gap-2 items-center">
        <label className="text-gray-700 dark:text-white font-medium">
          Filtrar por estado:
        </label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2 text-center text-gray-900 dark:text-white">
                Nombre
              </th>
              <th className="border p-2 text-center text-gray-900 dark:text-white">
                Email
              </th>
              <th className="border p-2 text-center text-gray-900 dark:text-white">
                Estado
              </th>
              <th className="border p-2 text-center text-gray-900 dark:text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {vendedoras.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-4 text-gray-900 dark:text-white"
                >
                  No hay vendedoras con este estado.
                </td>
              </tr>
            ) : (
              vendedoras.map((v) => (
                <tr key={v.id} className="bg-white dark:bg-gray-800">
                  <td className="border p-2 text-center text-gray-900 dark:text-white">
                    {v.nombre}
                  </td>
                  <td className="border p-2 text-center text-gray-900 dark:text-white">
                    {v.email}
                  </td>
                  <td
                    className={`border p-2 font-semibold text-center ${colorEstado[v.estado]} dark:text-white`}
                  >
                    {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
                  </td>
                  <td className="border p-2 flex justify-center gap-2 flex-wrap">
                    {v.email !== "admin@correo.com" && (
                      <>
                        {v.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() => abrirModal(v, "aprobada")}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => abrirModal(v, "rechazada")}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {v.estado === "aprobada" && (
                          <button
                            onClick={() => abrirModal(v, "rechazada")}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Desactivar
                          </button>
                        )}
                        {v.estado === "rechazada" && (
                          <button
                            onClick={() => abrirModal(v, "aprobada")}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                          >
                            Activar
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="md:hidden space-y-4">
        {vendedoras.length === 0 ? (
          <p className="text-center p-4 text-gray-900 dark:text-white">
            No hay vendedoras con este estado.
          </p>
        ) : (
          vendedoras.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg p-4 shadow-sm"
            >
              <p className="text-gray-900 dark:text-white">
                <span className="font-semibold">Nombre: </span> {v.nombre}
              </p>
              <p className="text-gray-900 dark:text-white break-words">
                <span className="font-semibold">Email: </span> {v.email}
              </p>
              <p
                className={`font-semibold mt-1 ${colorEstado[v.estado]} dark:text-white`}
              >
                Estado: {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
              </p>

              {v.email !== "admin@correo.com" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {v.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => abrirModal(v, "aprobada")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm w-full sm:w-auto"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => abrirModal(v, "rechazada")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm w-full sm:w-auto"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {v.estado === "aprobada" && (
                    <button
                      onClick={() => abrirModal(v, "rechazada")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm w-full sm:w-auto"
                    >
                      Desactivar
                    </button>
                  )}
                  {v.estado === "rechazada" && (
                    <button
                      onClick={() => abrirModal(v, "aprobada")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm w-full sm:w-auto"
                    >
                      Activar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      {modal.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Confirmar acción
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              ¿Seguro que quieres {modal.accion} a{" "}
              <span className="font-semibold">{modal.vendedora?.nombre}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
