import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import CatalogoTab from "./CatalogoTab";
import CategoriasTab from "./CategoriasTab";
import PagosTab from "./PagosTab";

import {
  Printer,
  Users,
  ClipboardList,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Hourglass
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("vendedoras");
  const [vendedorasData] = useState({
    pendientes: 2,
    aprobadas: 5,
    rechazadas: 1,
  });

  const metrics = [
    { title: "Vendedoras", value: vendedorasData.aprobadas + vendedorasData.pendientes + vendedorasData.rechazadas, icon: Users, color: "bg-blue-500" },
    { title: "Órdenes activas", value: 7, icon: ClipboardList, color: "bg-green-500" },
    { title: "Pagos pendientes", value: 3, icon: CreditCard, color: "bg-yellow-500" },
    { title: "Ingresos del mes", value: "$4,500", icon: DollarSign, color: "bg-purple-500" },
  ];

  const tabs = [
    { id: "vendedoras", label: "Vendedoras" },
    { id: "catalogo", label: "Catálogo" },
    { id: "categorias", label: "Categorías" },
    { id: "pagos", label: "Pagos" },
    { id: "impresion", label: "Impresión (CUPS)" },
    { id: "seguridad", label: "Seguridad" },
    { id: "configuracion", label: "Configuración" },
  ];

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
          <div key={metric.title} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
            <div className={`${metric.color} w-12 h-12 flex items-center justify-center rounded-full text-white`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">{metric.title}</h3>
              <p className="text-lg font-bold">{metric.value}</p>
            </div>
          </div>
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
        {activeTab === "vendedoras" && (
          <>
            {/* Tarjetas de gestión de vendedoras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <CardVendedora title="Pendientes" value={vendedorasData.pendientes} color="bg-yellow-400" icon={Hourglass} />
              <CardVendedora title="Aprobadas" value={vendedorasData.aprobadas} color="bg-green-400" icon={CheckCircle} />
              <CardVendedora title="Rechazadas" value={vendedorasData.rechazadas} color="bg-red-400" icon={XCircle} />
            </div>

            {/* Detalle pestañas */}
            <div className="bg-white p-4 rounded-2xl shadow">
              {vendedorasData.pendientes === 0 && vendedorasData.aprobadas === 0 && vendedorasData.rechazadas === 0 ? (
                <p className="text-gray-500">No hay vendedoras registradas aún</p>
              ) : (
                <p className="text-gray-500">
                  {vendedorasData.pendientes === 0
                    ? "No hay vendedoras pendientes, todas las solicitudes han sido aprobadas"
                    : `Hay ${vendedorasData.pendientes} vendedoras pendientes de aprobación`}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === "catalogo" && <CatalogoTab />}

        {activeTab !== "vendedoras" && activeTab !== "catalogo" && (
          <p className="text-gray-500">Contenido de {activeTab}</p>
        )}
        {activeTab === "categorias" && <CategoriasTab />}
        {activeTab === "pagos" && <PagosTab />}


      </div>
    </div>
  );
}

// Componente de tarjeta de vendedora
function CardVendedora({ title, value, color, icon: Icon }) {
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
