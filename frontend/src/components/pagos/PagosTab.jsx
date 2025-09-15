import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PagosTab() {
  const [vendedoras, setVendedoras] = useState([]);
  const [selectedVendedora, setSelectedVendedora] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPago, setUpdatingPago] = useState(false);
  const [filtroPago, setFiltroPago] = useState("todos");

  const calcularMontoDeuda = (deuda) => deuda?.monto || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/deudas/deudas");
        setVendedoras(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const aprobarPago = async (deudaId) => {
    setUpdatingPago(true);
    try {
      await axios.post(`http://127.0.0.1:8000/deudas/aprobar-pago/${deudaId}`);

      const actualizarDeudas = (deudas) =>
        deudas.map((d) => (d.id === deudaId ? { ...d, estado: "pagado" } : d));

      setSelectedVendedora({
        ...selectedVendedora,
        deudas: actualizarDeudas(selectedVendedora.deudas),
      });

      setVendedoras(
        vendedoras.map((v) =>
          v.vendedora_id === selectedVendedora.vendedora_id
            ? { ...v, deudas: actualizarDeudas(v.deudas) }
            : v
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingPago(false);
    }
  };

  const rechazarPago = async (deudaId) => {
    setUpdatingPago(true);
    try {
      await axios.post(`http://127.0.0.1:8000/deudas/rechazar-pago/${deudaId}`);

      const actualizarDeudas = (deudas) =>
        deudas.map((d) =>
          d.id === deudaId ? { ...d, estado: "rechazado" } : d
        );

      setSelectedVendedora({
        ...selectedVendedora,
        deudas: actualizarDeudas(selectedVendedora.deudas),
      });

      setVendedoras(
        vendedoras.map((v) =>
          v.vendedora_id === selectedVendedora.vendedora_id
            ? { ...v, deudas: actualizarDeudas(v.deudas) }
            : v
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingPago(false);
    }
  };

  const pagosFiltrados = selectedVendedora?.deudas?.filter((pago) => {
    if (filtroPago === "todos") return true;
    return pago.estado === filtroPago;
  });

  const totalPendiente =
    selectedVendedora?.deudas
      ?.filter((d) => d.estado === "pendiente_verificacion")
      .reduce((a, d) => a + calcularMontoDeuda(d), 0) || 0;

  const totalPagado =
    selectedVendedora?.deudas
      ?.filter((d) => d.estado === "pagado")
      .reduce((a, d) => a + calcularMontoDeuda(d), 0) || 0;

  return (
    <div className="p-6 text-gray-900 dark:text-white transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6">Gestión de Pagos</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Cargando vendedoras...</p>
      ) : (
        <table className="w-full border text-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 border">Vendedora</th>
              <th className="p-3 border">Deuda total</th>
              <th className="p-3 border">Acción</th>
            </tr>
          </thead>
          <tbody>
            {vendedoras.map((v) => (
              <tr
                key={v.vendedora_id}
                className="border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-3 border">{v.nombre}</td>
                <td className="p-3 border font-semibold">
                  ${v.total_deuda.toFixed(2)}
                </td>
                <td className="p-3 border">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setSelectedVendedora(v)}
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedVendedora && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-auto py-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative border border-gray-200 dark:border-gray-600 shadow-2xl transition-colors">
            <button
              onClick={() => setSelectedVendedora(null)}
              className="absolute top-5 right-5 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold text-2xl"
            >
              ×
            </button>

            <h3 className="font-bold text-2xl mb-2">{selectedVendedora.nombre}</h3>

            <div className="mb-4 flex gap-6">
              <p className="font-semibold">
                Pendiente verificación: ${totalPendiente.toFixed(2)}
              </p>
              <p className="font-semibold">Pagado: ${totalPagado.toFixed(2)}</p>
              <p className="font-semibold">
                Total: ${(totalPendiente + totalPagado).toFixed(2)}
              </p>
            </div>

            <div className="mb-4 flex gap-2 items-center">
              <label className="font-semibold">Filtrar:</label>
              <select
                value={filtroPago}
                onChange={(e) => setFiltroPago(e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendiente_verificacion">Pendientes</option>
                <option value="pagado">Pagados</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>

            {pagosFiltrados?.length > 0 ? (
              <table className="w-full text-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Monto</th>
                    <th className="p-2 border">Banco</th>
                    <th className="p-2 border">Referencia</th>
                    <th className="p-2 border">Comprobante</th>
                    <th className="p-2 border">Estado</th>
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((d) => (
                    <tr
                      key={d.id}
                      className={
                        d.estado === "pendiente_verificacion"
                          ? "bg-yellow-100 dark:bg-yellow-700"
                          : d.estado === "pagado"
                          ? "bg-green-100 dark:bg-green-700"
                          : "bg-red-100 dark:bg-red-700"
                      }
                    >
                      <td className="p-2 border">{d.id}</td>
                      <td className="p-2 border">${d.monto.toFixed(2)}</td>
                      <td className="p-2 border">{d.metodo || "-"}</td>
                      <td className="p-2 border">{d.referencia || "-"}</td>
                      <td className="p-2 border">
                        {d.capture_url ? (
                          <a
                            href={`http://127.0.0.1:8000/${d.capture_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Ver comprobante
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 border font-semibold">{d.estado}</td>
                      <td className="p-2 border">{d.fecha}</td>
                      <td className="p-2 border flex gap-2 justify-center">
                        {d.estado === "pendiente_verificacion" && (
                          <>
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                              onClick={() => aprobarPago(d.id)}
                              disabled={updatingPago}
                            >
                              Aprobar
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                              onClick={() => rechazarPago(d.id)}
                              disabled={updatingPago}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 dark:text-gray-300 mt-4">
                No hay pagos para mostrar
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
