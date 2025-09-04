import React, { useState, useEffect } from "react";
import axios from "axios";

export default function VendedorasTab() {
  const [vendedoras, setVendedoras] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  useEffect(() => {
    fetchVendedoras();
  }, []);

  const fetchVendedoras = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/vendedoras/");
      setVendedoras(res.data);
    } catch (err) {
      console.error("Error al traer vendedoras:", err);
    }
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      if (nuevoEstado === "aprobada") {
        await axios.post(`http://127.0.0.1:8000/admin/vendedoras/${id}/aprobar`);
      } else {
        await axios.post(`http://127.0.0.1:8000/admin/vendedoras/${id}/rechazar`);
      }
      // Actualizar el estado localmente sin depender del filtro
      setVendedoras((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, estado: nuevoEstado } : v
        )
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const colorEstado = {
    pendiente: "bg-yellow-200 text-yellow-800",
    aprobada: "bg-green-200 text-green-800",
    rechazada: "bg-red-200 text-red-800",
  };

  // Filtrar según el filtro seleccionado
  const vendedorasFiltradas = vendedoras.filter((v) => v.estado === filtroEstado);

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
                  {/* Mostrar siempre el botón según el estado */}
                  {v.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => handleActualizarEstado(v.id, "aprobada")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleActualizarEstado(v.id, "rechazada")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {v.estado === "aprobada" && (
                    <button
                      onClick={() => handleActualizarEstado(v.id, "rechazada")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Desactivar
                    </button>
                  )}
                  {v.estado === "rechazada" && (
                    <button
                      onClick={() => handleActualizarEstado(v.id, "aprobada")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Aprobar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
