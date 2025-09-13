import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ConfiguracionTab() {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/config_helper/limits",
        );
        setLimits(res.data);
      } catch (err) {
        console.error("Error al cargar límites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLimits({
      ...limits,
      [name]: name === "costoExcedente" ? parseFloat(value) : parseInt(value),
    });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:8000/config_helper/limits",
        limits,
      );
      alert(res.data.message || "Configuración guardada correctamente!");
    } catch (err) {
      console.error("Error al guardar límites:", err);
      alert("Error al guardar límites");
    }
  };

  if (loading || !limits)
    return (
      <p className="text-gray-700 dark:text-gray-300">
        Cargando configuración...
      </p>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Límites Globales
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {["diario", "semanal", "mensual", "costoExcedente"].map((key) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col transition-colors duration-300"
          >
            <label className="font-semibold mb-2 capitalize text-gray-700 dark:text-gray-300">
              {key}
            </label>
            <input
              type="number"
              name={key}
              step={key === "costoExcedente" ? "0.01" : "1"}
              value={limits[key] ?? 0}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <input
          type="checkbox"
          checked={Boolean(limits.applyToAll)}
          onChange={(e) =>
            setLimits({ ...limits, applyToAll: e.target.checked ? 1 : 0 })
          }
          className="h-5 w-5"
        />
        <span className="text-gray-700 dark:text-gray-300">
          Aplicar límites a todos los usuarios
        </span>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        Guardar Límites
      </button>
    </div>
  );
}
