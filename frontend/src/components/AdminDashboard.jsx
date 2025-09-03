import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import CatalogoTab from "./catalogo/CatalogoTab";
import CategoriasTab from "./CategoriasTab";
import PagosTab from "./PagosTab";
import ImpresionesTab from "./ImpresionesTab";
import VendedorasTab from "./VendedorasTab";
import SeguridadTab from "./SeguridadTab";
import ConfiguracionTab from "./ConfiguracionTab";

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
    { title: "Órdenes activas", value: 0, icon: ClipboardList, color: "bg-green-500" },
    { title: "Pagos pendientes", value: 0, icon: CreditCard, color: "bg-yellow-500" },
    { title: "Ingresos del mes", value: "$0", icon: DollarSign, color: "bg-purple-500" },
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

  // Traer métricas desde backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/dashboard/");
        const data = res.data;

        setMetrics([
          {
            title: "Vendedoras",
            value: data.vendedoras.aprobadas + data.vendedoras.pendientes + data.vendedoras.rechazadas,
            icon: Users,
            color: "bg-blue-500",
          },
          { title: "Órdenes activas", value: data.ordenes_activas, icon: ClipboardList, color: "bg-green-500" },
          { title: "Pagos pendientes", value: data.pagos_pendientes, icon: CreditCard, color: "bg-yellow-500" },
          { title: "Ingresos del mes", value: `$${data.ingresos_mes}`, icon: DollarSign, color: "bg-purple-500" },
        ]);
      } catch (err) {
        console.error("Error al traer métricas:", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Printer className="w-10 h-10 text-blue-600" />
          <h1 className="text-xl font-bold">MegaPrint</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">{user?.username || "No hay usuario"}</span>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
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
              activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña */}
      <div className="p-6">
        {activeTab === "vendedoras" && <VendedorasTab />}
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

// Componente de tarjeta de métrica
function MetricCard({ title, value, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
      <div className={`${color} w-12 h-12 flex items-center justify-center rounded-full text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
