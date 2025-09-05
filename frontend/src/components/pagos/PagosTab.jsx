import React, { useState, useEffect } from "react";

// ------------------- Mock para pruebas -------------------
const mockVendedoras = [
  {
    id: 1,
    nombre: "Raúl León",
    deuda_actual: 63.0,
    ultima_actualizacion: "25/8/2025, 7:13:33 p. m.",
    historial: [
      {
        id: 1,
        monto: 63.0,
        estado: "pendiente",
        fecha: "25/8/2025, 7:13:33 p. m.",
        metodo: "transferencia",
        referencia: "-",
        notas: "-",
      },
      {
        id: 2,
        monto: 30.0,
        estado: "pagado",
        fecha: "24/8/2025, 6:00:00 p. m.",
        metodo: "efectivo",
        referencia: "-",
        notas: "-",
      },
    ],
  },
  {
    id: 2,
    nombre: "Ana Pérez",
    deuda_actual: 0,
    ultima_actualizacion: "25/8/2025, 7:14:00 p. m.",
    historial: [],
  },
];

export default function PagoTab() {
  const [vendedoras, setVendedoras] = useState([]);
  const [resumen, setResumen] = useState({
    totalDeuda: 0,
    promedio: 0,
    conDeuda: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedVendedora, setSelectedVendedora] = useState(null);
  const [updatingPago, setUpdatingPago] = useState(false);
  const [filtroPago, setFiltroPago] = useState("todos");

  useEffect(() => {
    setTimeout(() => {
      setVendedoras(mockVendedoras);
      const totalDeuda = mockVendedoras.reduce((a, v) => a + v.deuda_actual, 0);
      const conDeuda = mockVendedoras.filter((v) => v.deuda_actual > 0).length;
      const promedio = conDeuda ? totalDeuda / conDeuda : 0;
      setResumen({ totalDeuda, promedio, conDeuda });
      setLoading(false);
    }, 500);
  }, []);

  const fetchHistorial = (vendedora) => {
    setSelectedVendedora(vendedora);
    setFiltroPago("todos");
  };

  const marcarPagado = (pagoId) => {
    setUpdatingPago(true);
    setTimeout(() => {
      const historialActualizado = selectedVendedora.historial.map((p) =>
        p.id === pagoId ? { ...p, estado: "pagado" } : p,
      );
      const deudaActualizada = historialActualizado.reduce(
        (a, p) => (p.estado === "pendiente" ? a + p.monto : a),
        0,
      );
      setSelectedVendedora({
        ...selectedVendedora,
        historial: historialActualizado,
        deuda_actual: deudaActualizada,
      });
      const vendedorasActualizadas = vendedoras.map((v) =>
        v.id === selectedVendedora.id
          ? { ...v, deuda_actual: deudaActualizada }
          : v,
      );
      setVendedoras(vendedorasActualizadas);
      setUpdatingPago(false);
    }, 500);
  };

  const pagosFiltrados = selectedVendedora?.historial?.filter((pago) => {
    if (filtroPago === "todos") return true;
    return pago.estado === filtroPago;
  });

  const totalPendiente =
    selectedVendedora?.historial
      ?.filter((p) => p.estado === "pendiente")
      .reduce((a, p) => a + p.monto, 0) || 0;
  const totalPagado =
    selectedVendedora?.historial
      ?.filter((p) => p.estado === "pagado")
      .reduce((a, p) => a + p.monto, 0) || 0;

  return (
    <div className="p-4 text-gray-900 dark:text-white transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Gestión de Pagos</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">
          Cargando vendedoras...
        </p>
      ) : (
        <>
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded flex flex-col gap-2">
            <p>Total deuda: ${resumen.totalDeuda.toFixed(2)}</p>
            <p>Vendedoras con deuda: {resumen.conDeuda}</p>
            <p>Promedio por vendedora: ${resumen.promedio.toFixed(2)}</p>
          </div>

          <table className="w-full border rounded text-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 border">Vendedora</th>
                <th className="p-2 border">Deuda</th>
                <th className="p-2 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vendedoras.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-gray-300 dark:border-gray-600"
                >
                  <td className="p-2 border">{v.nombre}</td>
                  <td className="p-2 border">${v.deuda_actual.toFixed(2)}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => fetchHistorial(v)}
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {selectedVendedora && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 overflow-auto py-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
            {/* Botón de cierre */}
            <button
              className="absolute top-5 right-5 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold text-2xl"
              onClick={() => setSelectedVendedora(null)}
            >
              ×
            </button>

            {/* Encabezado Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b pb-3">
              <div>
                <h3 className="font-bold text-2xl">
                  {selectedVendedora.nombre}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Deuda actual:{" "}
                  <span className="font-semibold">
                    ${selectedVendedora.deuda_actual.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-500 text-sm dark:text-gray-400">
                  Última actualización:{" "}
                  {selectedVendedora.ultima_actualizacion || "-"}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-700 p-4 rounded flex flex-col items-center justify-center">
                <p className="font-semibold text-lg">Pendiente</p>
                <p className="text-xl font-bold">
                  ${totalPendiente.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-700 p-4 rounded flex flex-col items-center justify-center">
                <p className="font-semibold text-lg">Pagado</p>
                <p className="text-xl font-bold">${totalPagado.toFixed(2)}</p>
              </div>
            </div>

            {/* Filtro */}
            <div className="mb-4 flex items-center gap-2">
              <label className="font-semibold">Filtrar pagos:</label>
              <select
                value={filtroPago}
                onChange={(e) => setFiltroPago(e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="pagado">Pagados</option>
              </select>
            </div>

            {/* Tabla de pagos */}
            {pagosFiltrados && pagosFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="p-2 border">ID</th>
                      <th className="p-2 border">Monto</th>
                      <th className="p-2 border">Estado</th>
                      <th className="p-2 border">Fecha</th>
                      <th className="p-2 border">Método</th>
                      <th className="p-2 border">Referencia</th>
                      <th className="p-2 border">Notas</th>
                      <th className="p-2 border">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map((pago) => (
                      <tr
                        key={pago.id}
                        className={
                          pago.estado === "pendiente"
                            ? "bg-yellow-100 dark:bg-yellow-700"
                            : "bg-green-100 dark:bg-green-700"
                        }
                      >
                        <td className="p-2 border">{pago.id}</td>
                        <td className="p-2 border">${pago.monto.toFixed(2)}</td>
                        <td className="p-2 border font-semibold">
                          {pago.estado}
                        </td>
                        <td className="p-2 border">{pago.fecha}</td>
                        <td className="p-2 border">{pago.metodo}</td>
                        <td className="p-2 border">{pago.referencia || "-"}</td>
                        <td className="p-2 border">{pago.notas || "-"}</td>
                        <td className="p-2 border">
                          {pago.estado === "pendiente" && (
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                              onClick={() => marcarPagado(pago.id)}
                              disabled={updatingPago}
                            >
                              Marcar como pagado
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay pagos para mostrar.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
