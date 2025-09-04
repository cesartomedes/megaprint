import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import CatalogoTab from "./catalogo/CatalogoTab";
import CategoriasTab from "./CategoriasTab";
import ImpresionesTab from "./impresiones/ImpresionesTab";
import SeguridadTab from "./SeguridadTab";
import ConfiguracionTab from "./ConfiguracionTab";
import PagosTab from "./pagos/PagosTab";

import {
  Printer,
  Users,
  ClipboardList,
  CreditCard,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);

  // Estado de métricas
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

  // Estado de pestañas
  const [activeTab, setActiveTab] = useState("vendedoras");
  const tabs = [
    { id: "vendedoras", label: "Vendedoras" },
    { id: "catalogo", label: "Catálogo" },
    { id: "categorias", label: "Categorías" },
    { id: "pagos", label: "Pagos" },
    { id: "impresion", label: "Impresión (CUPS)" },
    { id: "seguridad", label: "Seguridad" },
    { id: "configuracion", label: "Configuración" },
  ];

  // Vendedoras
  const [vendedoras, setVendedoras] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === "vendedoras") {
      fetchVendedoras();
    }
  }, [activeTab]);
  // Traer métricas
  const fetchMetrics = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/dashboard/");
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
        {
          title: "Ingresos del mes",
          value: `$${data.ingresos_mes}`,
          icon: DollarSign,
          color: "bg-purple-500",
        },
      ]);
    } catch (err) {
      console.error("Error al traer métricas:", err);
    }
  };

  // Traer vendedoras según filtro
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
      fetchVendedoras(); // refresca la lista
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  // Filtrar por estado
  const vendedorasFiltradas = vendedoras.filter(
    (v) => v.estado === filtroEstado,
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Printer className="w-10 h-10 text-blue-600" />
          <h1 className="text-xl font-bold">MegaPrint</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">
            {user?.username || "No hay usuario"}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Pestañas */}
      <div className="bg-white shadow rounded-2xl mx-6 mt-6 p-4 flex gap-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de pestaña */}
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
        {activeTab === "impresion" && <ImpresionesTab />}
        {activeTab === "seguridad" && <SeguridadTab />}
        {activeTab === "configuracion" && <ConfiguracionTab />}
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
      <div
        className={`${color} w-12 h-12 flex items-center justify-center rounded-full text-white`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

// Tabla de vendedoras con colores según estado y filtro
function VendedorasTab({
  vendedoras,
  filtroEstado,
  setFiltroEstado,
  handleActualizarEstado,
}) {
  const colorEstado = {
    pendiente: "bg-yellow-200 text-yellow-800",
    aprobada: "bg-green-200 text-green-800",
    rechazada: "bg-red-200 text-red-800",
  };

  // Modal
  const [modal, setModal] = useState({
    visible: false,
    vendedora: null,
    accion: null,
  });

  const abrirModal = (vendedora, accion) => {
    setModal({ visible: true, vendedora, accion });
  };

  const cerrarModal = () => {
    setModal({ visible: false, vendedora: null, accion: null });
  };

  const confirmarAccion = () => {
    handleActualizarEstado(modal.vendedora.id, modal.accion);
    cerrarModal();
  };

  // Filtrar vendedoras según estado seleccionado
  const vendedorasFiltradas = vendedoras.filter(
    (v) => v.estado === filtroEstado,
  );

  return (
    <div>
      {/* Filtro */}
      <div className="mb-4 flex gap-2">
        <label>Filtrar por estado:</label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-center">Nombre</th>
            <th className="border p-2 text-center">Email</th>
            <th className="border p-2 text-center">Estado</th>
            <th className="border p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedorasFiltradas.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No hay vendedoras con este estado.
              </td>
            </tr>
          ) : (
            vendedorasFiltradas.map((v) => (
              <tr key={v.id}>
                <td className="border p-2 text-center">{v.nombre}</td>
                <td className="border p-2 text-center">{v.email}</td>
                <td
                  className={`border p-2 font-semibold text-center ${colorEstado[v.estado]}`}
                >
                  {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  {/* Si NO es admin, mostrar botones */}
                  {v.email !== "admin@correo.com" && (
                    <>
                      {v.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => abrirModal(v, "aprobada")}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => abrirModal(v, "rechazada")}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {v.estado === "aprobada" && (
                        <button
                          onClick={() => abrirModal(v, "rechazada")}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Desactivar
                        </button>
                      )}
                      {v.estado === "rechazada" && (
                        <button
                          onClick={() => abrirModal(v, "aprobada")}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
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

      {/* Modal */}
      {modal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirmar acción</h3>
            <p className="mb-6">
              ¿Seguro que quieres{" "}
              <span className="font-semibold">{modal.accion}</span> a{" "}
              <span className="font-semibold">{modal.vendedora.nombre}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                className={`px-4 py-2 rounded text-white ${
                  modal.accion === "aprobada"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
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
