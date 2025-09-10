// AdminPagos.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminPagos({ darkMode }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPago, setModalPago] = useState(null); // pago seleccionado para modal
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 🔹 Fetch pagos
  const fetchPagos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/pagos/");
      // res.data debe venir con: id, vendedora.nombre, monto, estado, fecha, metodo, referencia, capture_url
      const datos = res.data.map((pago) => ({
        ...pago,
        fecha: pago.fecha,
      }));
      // Ordenar por fecha descendente
      datos.sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf());
      setPagos(datos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
    const interval = setInterval(fetchPagos, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(pagos.length / itemsPerPage);
  const paginatedData = pagos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading)
    return (
      <p className="text-white dark:text-gray-200 text-center mt-4">
        Cargando pagos...
      </p>
    );
  if (pagos.length === 0)
    return (
      <p className="text-white dark:text-gray-200 text-center mt-4">
        No hay pagos registrados aún.
      </p>
    );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
      <h3 className="text-gray-700 dark:text-white font-bold mb-6 text-2xl">
        Historial de Pagos
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {[
                "Vendedora",
                "Monto ($)",
                "Fecha",
                "Estado",
                "Método",
                "Referencia",
                "Capture",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 border text-gray-700 dark:text-white font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((pago, idx) => (
              <tr
                key={idx}
                className={`even:bg-gray-50 dark:even:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  pago.estado === "pendiente"
                    ? "bg-red-100 dark:bg-red-700 text-white"
                    : ""
                }`}
              >
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {pago.vendedora.nombre}
                </td>
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {pago.monto.toFixed(2)}
                </td>
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {dayjs(pago.fecha)
                    .subtract(4, "hour")
                    .format("DD/MM/YYYY HH:mm")}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm font-semibold ${
                      pago.estado === "pendiente"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {pago.estado}
                  </span>
                </td>
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {pago.metodo || "-"}
                </td>
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {pago.referencia || "-"}
                </td>
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {pago.capture_url ? (
                    <a
                      href={pago.capture_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded disabled:opacity-50 transition-colors"
        >
          Anterior
        </button>
        <span className="text-gray-700 dark:text-white font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded disabled:opacity-50 transition-colors"
        >
          Siguiente
        </button>
      </div>

      {/* Modal registro pago */}
      {modalPago && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div
            className={`w-full max-w-md rounded-xl p-6 shadow-xl text-center ${
              darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>

            <div className="mb-4 text-left">
              <label className="block mb-1">Método:</label>
              <select className="w-full p-2 rounded border">
                <option value="PagoMovil">Pago Móvil</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>

              <label className="block mt-3 mb-1">Referencia:</label>
              <input
                type="text"
                className="w-full p-2 rounded border"
                placeholder="Referencia del pago"
              />

              <label className="block mt-3 mb-1">Capture:</label>
              <input type="file" className="w-full" />
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setModalPago(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  alert("✅ Pago registrado (a implementar backend)");
                  setModalPago(null);
                }}
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
