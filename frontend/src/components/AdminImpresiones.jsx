import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

export default function AdminImpresiones() {
  const [impresiones, setImpresiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 20;

  const LIMITE_DIARIO = 50;   // Ajuste del límite diario
  const LIMITE_SEMANAL = 150; // Límite semanal

  const fetchImpresiones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:8000/impresiones/impresiones/"
      );

      const datos = [];
      const acumulados = {};

      response.data.forEach((vendedora) => {
        const nombre = vendedora.usuario.nombre;

        // Conteos diarios
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

        // Conteos semanales
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

      datos.sort(
        (a, b) => dayjs(b.creado_en).valueOf() - dayjs(a.creado_en).valueOf()
      );

      // Calcular exceso para cada impresión usando acumulado y límite
      const datosConExcedido = datos.map((imp) => {
        const key = `${imp.vendedora}-${imp.tipo}`;
        const limite = imp.tipo === "Diaria" ? LIMITE_DIARIO : LIMITE_SEMANAL;
        const exceso = acumulados[key] > limite ? acumulados[key] - limite : 0;
        return { ...imp, excedido: exceso > 0, exceso };
      });

      setImpresiones(datosConExcedido);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las impresiones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpresiones();
    const interval = setInterval(fetchImpresiones, 30000);
    return () => clearInterval(interval);
  }, [fetchImpresiones]);

  const totalPages = Math.ceil(
    impresiones.filter(
      (imp) =>
        imp.vendedora.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.volante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    ).length / itemsPerPage
  );

  const paginatedData = impresiones
    .filter(
      (imp) =>
        imp.vendedora.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.volante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading)
    return <p className="text-white text-center mt-4">Cargando impresiones...</p>;

  if (impresiones.length === 0)
    return (
      <p className="text-white text-center mt-4">
        No hay impresiones registradas aún.
      </p>
    );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 transition-colors duration-300 text-gray-800 dark:text-white">
      <h3 className="font-bold mb-4 text-2xl">Historial de impresiones</h3>

      {/* Filtro */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por vendedora, tipo o volante..."
          className="p-2 rounded border dark:bg-gray-700 dark:text-white flex-1"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {["Tipo", "Vendedora", "Volante", "Cantidad", "Fecha y Hora"].map(
                (col) => (
                  <th key={col} className="px-4 py-2 border font-medium">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((imp, idx) => (
              <tr
                key={idx}
                className={`even:bg-gray-50 dark:even:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  imp.excedido ? "bg-red-100 dark:bg-red-700" : ""
                }`}
              >
                <td className="px-2 py-1 border">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                      imp.tipo === "Diaria" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  >
                    {imp.tipo}
                  </span>
                </td>
                <td className="px-2 py-1 border flex items-center">
                  {imp.vendedora}
                  {imp.excedido && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-red-200 dark:bg-red-700 text-red-700 dark:text-white">
                      {imp.exceso} excedió
                    </span>
                  )}
                </td>
                <td className="px-2 py-1 border">{imp.volante}</td>
                <td className="px-2 py-1 border">{imp.total}</td>
                <td className="px-2 py-1 border">
                  {dayjs(imp.creado_en)
                    .subtract(4, "hour")
                    .format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {paginatedData.map((imp, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border shadow transition-colors ${
              imp.excedido
                ? "bg-red-100 dark:bg-red-700 border-red-400"
                : "bg-gray-50 dark:bg-gray-900 border-gray-300"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                  imp.tipo === "Diaria" ? "bg-blue-500" : "bg-green-500"
                }`}
              >
                {imp.tipo}
              </span>
              {imp.excedido && (
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-200 dark:bg-red-700 text-red-700 dark:text-white">
                  {imp.exceso} excedió
                </span>
              )}
            </div>
            <p className="text-sm font-semibold">{imp.vendedora}</p>
            <p className="text-sm">{imp.volante}</p>
            <p className="text-sm">{imp.total}</p>
            <p className="text-sm">
              {dayjs(imp.creado_en)
                .subtract(4, "hour")
                .format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
