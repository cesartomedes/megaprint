import React, { useState } from "react";
import { FaCog, FaUserPlus, FaPrint } from "react-icons/fa";
import ConfiguracionCUPS from "./ConfiguracionCUPS";
import GestionAgente from "./GestionAgente";
import TrabajosImpresion from "./TrabajosImpresion";

const ImpresionesTab = () => {
  const [activeTab, setActiveTab] = useState("config");

  // Datos compartidos
  const [printerConfig, setPrinterConfig] = useState({
    nombre: "LaserJet 123",
    copiasPorDefecto: 1,
    tamanoPorDefecto: "Carta",
    colorPorDefecto: "Sí",
    maintenanceMode: false,
    limits: { diario: 30, semanal: 120, mensual: 500, costoExcedente: 0.5 },
  });

  const [agentInfo, setAgentInfo] = useState({
    email: "printer-agent@cups.local",
    password: "•••••••••••••••••",
    estado: "Desconocido",
  });

  const [jobs, setJobs] = useState([
    { id: 1, estado: "En cola", titulo: "Prueba 1", impresora: "impresora", copias: 1, creado: "hace 1 día", accion: "Cancelar" },
    { id: 2, estado: "Cancelado", titulo: "Prueba 2", impresora: "laser", copias: 1, creado: "hace 8 días", accion: null },
    { id: 3, estado: "En cola", titulo: "Documento 2", impresora: "impresora", copias: 2, creado: "hace 2 días", accion: "Cancelar" },
  ]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Impresiones (CUPS)</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "config" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaCog /> <span>Configuración CUPS</span>
        </button>
        <button
          onClick={() => setActiveTab("agent")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "agent" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaUserPlus /> <span>Gestión del Agente</span>
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === "jobs" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <FaPrint /> <span>Trabajos de Impresión</span>
        </button>
      </div>

      {/* Tabs content */}
      {activeTab === "config" && (
        <ConfiguracionCUPS printerConfig={printerConfig} setPrinterConfig={setPrinterConfig} />
      )}
      {activeTab === "agent" && (
        <GestionAgente agentInfo={agentInfo} setAgentInfo={setAgentInfo} />
      )}
      {activeTab === "jobs" && <TrabajosImpresion jobs={jobs} setJobs={setJobs} />}
    </div>
  );
};

export default ImpresionesTab;
