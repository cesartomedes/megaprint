import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function PagosTab() {
  const [stats, setStats] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/pagos/stats");
      setStats(res.data);
    } catch (err) {
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (user) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/pagos/detalle/${encodeURIComponent(user)}`
      );
      setDetalle(res.data);
    } catch (err) {
      toast.error("Error al cargar detalles");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p>Cargando estadísticas...</p>;

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-xl font-bold mb-4">Gestión de Pagos</h2>

      {detalle ? (
        <div className="bg-white p-6 rounded-xl shadow mb-4">
          <h3 className="text-xl font-bold mb-2">Detalle de {detalle.user}</h3>
          <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
            <p className="text-gray-700 font-medium">
              Deuda actual:{" "}
              <span className="text-red-600">
                ${detalle.deuda_actual.toFixed(2)}
              </span>
            </p>
            <p className="text-gray-500">
              Última actualización:{" "}
              {new Date(detalle.ultima_actualizacion).toLocaleString()}
            </p>
          </div>

          <h4 className="mt-4 font-semibold text-gray-700">Historial de pagos:</h4>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">ID</th>
                  <th className="border px-3 py-2 text-left">Monto</th>
                  <th className="border px-3 py-2 text-left">Estado</th>
                  <th className="border px-3 py-2 text-left">Fecha</th>
                  <th className="border px-3 py-2 text-left">Método</th>
                  <th className="border px-3 py-2 text-left">Referencia</th>
                  <th className="border px-3 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {detalle.historial && detalle.historial.length > 0 ? (
                  detalle.historial.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{p.id}</td>
                      <td className="border px-3 py-2">${p.monto.toFixed(2)}</td>
                      <td
                        className={`border px-3 py-2 font-medium ${
                          p.status === "pendiente"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {p.status}
                      </td>
                      <td className="border px-3 py-2">
                        {new Date(p.fecha).toLocaleString()}
                      </td>
                      <td className="border px-3 py-2">{p.metodo}</td>
                      <td className="border px-3 py-2">{p.referencia || "-"}</td>
                      <td className="border px-3 py-2">{p.notas || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="border px-3 py-2 text-center text-gray-500">
                      No hay pagos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            onClick={() => setDetalle(null)}
          >
            Volver
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total deuda: ${stats?.total_deuda.toFixed(2)}</p>
          <p>Vendedoras con deuda: {stats?.vendedoras_con_deuda}</p>
          <p>Promedio por vendedora: ${stats?.promedio.toFixed(2)}</p>

          <h4 className="mt-4 font-semibold">Vendedoras con deuda pendiente:</h4>
          <ul>
            {stats?.vendedoras?.map(([user, monto]) => (
              <li key={user} className="mb-2">
                {user} - ${monto.toFixed(2)}{" "}
                <button
                  className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => verDetalle(user)}
                >
                  Ver detalles
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
