import React from "react";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaLock, FaFileAlt } from "react-icons/fa";

const SeguridadTab = () => {
  const estadoSeguridad = [
    { nombre: "Command Injection Vulnerability", nivel: "CRITICAL", detalle: "CUPS agent vulnerable to command injection - FIXED", icon: <FaExclamationTriangle className="text-red-500 w-5 h-5" /> },
    { nombre: "Public PDF Storage", nivel: "WARN", detalle: "PDF bucket made private with RLS policies - FIXED", icon: <FaExclamationTriangle className="text-yellow-500 w-5 h-5" /> },
    { nombre: "RPC Functions Hardened", nivel: "INFO", detalle: "All print RPC functions now require proper authentication", icon: <FaCheckCircle className="text-green-500 w-5 h-5" /> },
    { nombre: "Audit Logging Enabled", nivel: "INFO", detalle: "Database changes are now logged for security monitoring", icon: <FaCheckCircle className="text-green-500 w-5 h-5" /> },
  ];

  const logsAuditoria = [
    { tipo: "UPDATE", tabla: "print_jobs", fecha: "9/3/2025, 9:27:10 AM" },
    { tipo: "INSERT", tabla: "pdfs", fecha: "9/3/2025, 8:27:10 AM" },
  ];

  const medidasSeguridad = [
    { nombre: "RLS Activado", descripcion: "En todas las tablas", icon: <FaLock className="w-5 h-5 text-blue-500" /> },
    { nombre: "PDFs Privados", descripcion: "Acceso con URLs firmadas", icon: <FaFileAlt className="w-5 h-5 text-blue-500" /> },
    { nombre: "Agente Seguro", descripcion: "Sin vulnerabilidades", icon: <FaShieldAlt className="w-5 h-5 text-blue-500" /> },
    { nombre: "RPC Hardening", descripcion: "Funciones protegidas", icon: <FaLock className="w-5 h-5 text-blue-500" /> },
    { nombre: "Auditoría", descripcion: "Logs automáticos", icon: <FaFileAlt className="w-5 h-5 text-blue-500" /> },
    { nombre: "Roles Específicos", descripcion: "printer_agent role", icon: <FaShieldAlt className="w-5 h-5 text-blue-500" /> },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6 text-gray-900 dark:text-white transition-colors duration-300">
      <h2 className="text-xl font-bold">Panel de Seguridad</h2>

      {/* Estado de Seguridad */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Estado de Seguridad</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-3">Evaluación de vulnerabilidades y controles de seguridad</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {estadoSeguridad.map((item, idx) => (
            <div key={idx} className="flex items-start p-4 rounded-lg shadow-sm gap-3 bg-gray-50 dark:bg-gray-700">
              {item.icon}
              <div>
                <p className="font-semibold">{item.nombre}</p>
                <p className={`text-sm ${item.nivel === "CRITICAL" ? "text-red-600 dark:text-red-400" : item.nivel === "WARN" ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                  {item.nivel}
                </p>
                <p className="text-gray-500 dark:text-gray-300 text-sm">{item.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs de Auditoría */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Logs de Auditoría</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600 text-sm text-left">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-2 border-b">Tipo</th>
                <th className="p-2 border-b">Tabla</th>
                <th className="p-2 border-b">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logsAuditoria.map((log, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-gray-100 dark:hover:bg-gray-600`}>
                  <td className="p-2 border-b">{log.tipo}</td>
                  <td className="p-2 border-b">{log.tabla}</td>
                  <td className="p-2 border-b">{log.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medidas de Seguridad Implementadas */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Medidas de Seguridad Implementadas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medidasSeguridad.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700">
              {item.icon}
              <div>
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-gray-500 dark:text-gray-300 text-sm">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeguridadTab;
