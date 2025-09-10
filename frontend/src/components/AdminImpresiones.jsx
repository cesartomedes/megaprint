import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender Day.js con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminImpresiones() {
  const [impresiones, setImpresiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(""); // 👈 corrijo: antes estaba mal definido
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const LIMITE_DIARIO = 30;
  const LIMITE_SEMANAL = 150;

  const fetchImpresiones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8000/impresiones/");
      const datos = [];

      // Crear un mapa para acumular totales por vendedora y tipo
      const acumulados = {};

      response.data.forEach((vendedora) => {
        const nombre = vendedora.usuario.nombre;

        vendedora.conteosDiarios.forEach((imp) => {
          const key = `${nombre}-Diaria`;
          if (!acumulados[key]) acumulados[key] = 0;
          acumulados[key] += imp.total;

          datos.push({
            tipo: "Diaria",
            vendedora: nombre,
            volante: imp.volante.nombre,
            total: imp.total,
            creado_en: imp.fecha_hora || imp.creado_en,
          });
        });

        vendedora.conteosSemanales.forEach((imp) => {
          const key = `${nombre}-Semanal`;
          if (!acumulados[key]) acumulados[key] = 0;
          acumulados[key] += imp.total;

          datos.push({
            tipo: "Semanal",
            vendedora: nombre,
            volante: imp.volante.nombre,
            total: imp.total,
            creado_en: imp.fecha_hora || imp.creado_en,
          });
        });
      });

      // Ordenar por fecha: la última vendedora que imprimió primero
      datos.sort(
        (a, b) => dayjs(b.creado_en).valueOf() - dayjs(a.creado_en).valueOf(),
      );

      // Marcar excedidos según el total acumulado
      const datosConExcedido = datos.map((imp) => {
        const key = `${imp.vendedora}-${imp.tipo}`;
        const limite = imp.tipo === "Diaria" ? LIMITE_DIARIO : LIMITE_SEMANAL;
        return { ...imp, excedido: acumulados[key] > limite };
      });

      setImpresiones(datosConExcedido);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las impresiones");
    } finally {
      setLoading(false);
    }
  }, []); // 👈 vacío, no depende de props ni state

  useEffect(() => {
    fetchImpresiones();
    const interval = setInterval(fetchImpresiones, 30000);
    return () => clearInterval(interval);
  }, [fetchImpresiones]); // 👈 añadimos fetchImpresiones como dependencia

  const totalPages = Math.ceil(impresiones.length / itemsPerPage);
  const paginatedData = impresiones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading)
    return (
      <p className="text-white dark:text-gray-200 text-center mt-4">
        Cargando impresiones...
      </p>
    );
  if (impresiones.length === 0)
    return (
      <p className="text-white dark:text-gray-200 text-center mt-4">
        No hay impresiones registradas aún.
      </p>
    );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
      <h3 className="text-gray-700 dark:text-white font-bold mb-6 text-2xl">
        Historial de impresiones
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {["Tipo", "Vendedora", "Volante", "Cantidad", "Fecha y Hora"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-2 border text-gray-700 dark:text-white font-medium"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((imp, idx) => (
              <tr
                key={idx}
                className={`even:bg-gray-50 dark:even:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  imp.excedido ? "bg-red-100 dark:bg-red-700 text-white" : ""
                }`}
              >
                {/* Tipo */}
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm font-semibold ${
                      imp.tipo === "Diaria" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {imp.tipo}
                  </span>
                </td>

                {/* Vendedora + Badge de exceso */}
                <td className="px-4 py-2 border text-gray-800 dark:text-white flex items-center">
                  {imp.vendedora}
                  {imp.excedido && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold rounded bg-red-200 dark:bg-red-700 text-red-700 dark:text-white">
                      {imp.total} excedió el límite
                    </span>
                  )}
                </td>

                {/* Volante */}
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {imp.volante}
                </td>

                {/* Cantidad */}
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {imp.total}
                </td>

                {/* Fecha y hora */}
                <td className="px-4 py-2 border text-gray-800 dark:text-white">
                  {dayjs(imp.creado_en)
                    .subtract(4, "hour") // UTC -4
                    .format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
