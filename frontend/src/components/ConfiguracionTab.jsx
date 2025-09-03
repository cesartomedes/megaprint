import React, { useState } from "react";

export default function ConfiguracionTab() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [limits, setLimits] = useState({
    diario: 30,
    semanal: 120,
    mensual: 500,
    costoExcedente: 0.5,
  });
  const [applyToAll, setApplyToAll] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLimits({ ...limits, [name]: value });
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar configuración en el backend
    console.log("Configuración guardada:", { maintenanceMode, limits, applyToAll });
    alert("Configuración guardada correctamente!");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold">Información del Sistema</h2>

      {/* Nombre del Sistema */}
      <div>
        <label className="block font-semibold mb-1">Nombre del Sistema</label>
        <input
          type="text"
          value="Sistema de Impresión"
          readOnly
          className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Modo Mantenimiento */}
      <div className="flex items-center gap-4">
        <label className="font-semibold">Modo Mantenimiento:</label>
        <input
          type="checkbox"
          checked={maintenanceMode}
          onChange={(e) => setMaintenanceMode(e.target.checked)}
          className="h-5 w-5"
        />
        <span className="text-gray-500">
          Cuando está activo, solo los administradores pueden acceder al sistema
        </span>
      </div>

      {/* Límites Globales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Límites Globales Predeterminados</h3>
        <p className="text-gray-500 text-sm">
          Estos límites se aplicarán a nuevos usuarios y pueden aplicarse a todos los usuarios existentes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div>
            <label className="block font-semibold mb-1">Límite Diario (páginas)</label>
            <input
              type="number"
              name="diario"
              value={limits.diario}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Límite Semanal (páginas)</label>
            <input
              type="number"
              name="semanal"
              value={limits.semanal}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Límite Mensual (páginas)</label>
            <input
              type="number"
              name="mensual"
              value={limits.mensual}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Costo por Página Excedente ($)</label>
            <input
              type="number"
              name="costoExcedente"
              step="0.01"
              value={limits.costoExcedente}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Aplicar a todos los usuarios */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-gray-500">
            Aplicar límites a todos los usuarios existentes
          </span>
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar Límites
        </button>

        <p className="text-red-500 text-sm mt-2">
          Atención: Al aplicar límites globales, se actualizarán las configuraciones de límites de TODOS los usuarios existentes con los valores mostrados arriba.
        </p>
      </div>
    </div>
  );
}
