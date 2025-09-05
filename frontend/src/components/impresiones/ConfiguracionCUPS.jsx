import React, { useState, useEffect } from "react";

export default function ConfiguracionCUPS({ printerConfig, setPrinterConfig }) {
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/printers")
      .then((res) => res.json())
      .then((data) => {
        setPrinters(data);
        // Si aún no hay impresora seleccionada, asignar la primera
        if (!printerConfig.nombre && data.length > 0) {
          setPrinterConfig({ ...printerConfig, nombre: data[0].name });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrinterConfig({
      ...printerConfig,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    console.log("Configuración guardada:", printerConfig);
    alert("Configuración guardada correctamente!");
    // Aquí podrías enviar a backend si quieres persistir
    // fetch("/api/save-config", { method: "POST", body: JSON.stringify(printerConfig) })
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold">Configuración de Impresora</h2>

      {/* Selección de impresora */}
      <div>
        <label className="block font-semibold mb-1">
          Impresora disponible:
        </label>
        <select
          name="nombre"
          value={printerConfig.nombre || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded-md"
        >
          {printers.map((p, i) => (
            <option key={i} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Copias y tamaño */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block font-semibold mb-1">Copias por defecto</label>
          <input
            type="number"
            name="copiasPorDefecto"
            value={printerConfig.copiasPorDefecto}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tamaño por defecto</label>
          <input
            type="text"
            name="tamanoPorDefecto"
            value={printerConfig.tamanoPorDefecto}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>
      </div>

      {/* Modo mantenimiento */}
      <div className="flex items-center gap-4 mt-4">
        <label>Modo mantenimiento:</label>
        <input
          type="checkbox"
          name="maintenanceMode"
          checked={printerConfig.maintenanceMode}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Guardar
      </button>
    </div>
  );
}
