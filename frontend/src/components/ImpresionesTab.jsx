import React, { useState } from "react";
import { FaCog, FaUserPlus, FaPrint } from "react-icons/fa";

const ImpresionesTab = () => {
  const [activeTab, setActiveTab] = useState("config");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const jobs = [
    {
      estado: "En cola",
      titulo: "Prueba de impresión",
      impresora: "impresora",
      copias: 1,
      creado: "hace 1 día",
      accion: "Cancelar",
    },
    {
      estado: "Cancelado",
      titulo: "Prueba de impresión",
      impresora: "laser",
      copias: 1,
      creado: "hace 8 días",
      accion: null,
    },
    {
      estado: "En cola",
      titulo: "Documento 2",
      impresora: "impresora",
      copias: 2,
      creado: "hace 2 días",
      accion: "Cancelar",
    },
    // agrega más trabajos según tus datos
  ];

  // Filtrar trabajos según estado y búsqueda
  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === "all" || job.estado === filter;
    const matchesSearch =
      job.titulo.toLowerCase().includes(search.toLowerCase()) ||
      job.impresora.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Impresiones (CUPS)</h2>

      {/* Tabs Navigation */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "config"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaCog /> <span>Configuración CUPS</span>
        </button>
        <button
          onClick={() => setActiveTab("agent")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "agent"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaUserPlus /> <span>Gestión del Agente</span>
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "jobs"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaPrint /> <span>Trabajos de Impresión</span>
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === "config" && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Configuración de Impresión (CUPS)
          </h3>
          <div className="space-y-2">
            <p>
              <b>Nombre de la Impresora:</b> impresora
            </p>
            <p>
              <b>Copias por Defecto:</b> 1
            </p>
            <p>
              <b>Tamaño por Defecto:</b> Carta
            </p>
            <p>
              <b>Impresión a Color por Defecto:</b> Sí
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Guardar Configuración
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Prueba de Impresión
            </button>
          </div>
        </div>
      )}

      {activeTab === "agent" && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Gestión del Agente de Impresión
          </h3>
          <div className="space-y-2">
            <p>
              <b>Email del Agente:</b> printer-agent@cups.local
            </p>
            <p>
              <b>Contraseña del Agente:</b> •••••••••••••••••
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Crear Usuario del Agente
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Asignar Rol de Agente
            </button>
          </div>

          <h4 className="mt-6 font-semibold">
            Instrucciones de Configuración del Agente
          </h4>
          <pre className="bg-gray-100 p-4 rounded-md mt-2 text-sm">
            {`sudo mkdir -p /tmp/print-jobs && sudo chmod 755 /tmp/print-jobs
cd cups-agent
npm install
npm start`}
          </pre>

          <p className="mt-3">
            <b>Estado del Agente:</b> Desconocido
          </p>
          <p>El estado se actualizará cuando el agente se conecte</p>
        </div>
      )}

      {activeTab === "jobs" && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Trabajos de Impresión Recientes
          </h3>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="estado" className="font-medium">
                Estado:
              </label>
              <select
                id="estado"
                className="border px-2 py-1 rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="En cola">En cola</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="search" className="font-medium">
                Buscar:
              </label>
              <input
                id="search"
                type="text"
                placeholder="Título o Impresora"
                className="border px-2 py-1 rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border-b">Estado</th>
                  <th className="p-2 border-b">Título</th>
                  <th className="p-2 border-b">Impresora</th>
                  <th className="p-2 border-b">Copias</th>
                  <th className="p-2 border-b">Creado</th>
                  <th className="p-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-2 text-center text-gray-500">
                      No se encontraron trabajos
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2 border-b">{job.estado}</td>
                      <td className="p-2 border-b">{job.titulo}</td>
                      <td className="p-2 border-b">{job.impresora}</td>
                      <td className="p-2 border-b">{job.copias}</td>
                      <td className="p-2 border-b">{job.creado}</td>
                      <td className="p-2 border-b">
                        {job.accion ? (
                          <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                            {job.accion}
                          </button>
                        ) : (
                          <span className="text-gray-500">No disponible</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpresionesTab;
