import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraVolantes({
  darkMode,
  setCantidadVolantes,
  setTotalHoy,
  setTotalSemana,
  limits,
  onConfirmarImpresion,
}) {
  const { user } = useContext(AuthContext);
  const [volantes, setVolantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conteosDiarios, setConteosDiarios] = useState({});
  const [conteosSemanales, setConteosSemanales] = useState({});
  const [modalVolante, setModalVolante] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [haySeleccion, setHaySeleccion] = useState(false);
  const [animarBadge, setAnimarBadge] = useState({});

  const {
    diario: LIMITE_DIARIO = 30,
    semanal: LIMITE_SEMANAL = 120,
    costoExcedente: COSTO_EXTRA = 0.5,
  } = limits || {};

  // 🔹 Cargar volantes y conteos iniciales
  useEffect(() => {
    if (!user?.id) return;

    async function fetchVolantes() {
      try {
        const res = await axios.get(
          `http://localhost:8000/catalogos/vendedora/${user.id}`,
        );
        const data = res.data;
        setVolantes(data);
        setCantidadVolantes(data.length);

        const today = new Date().toISOString().split("T")[0];
        const savedDiarios = JSON.parse(
          localStorage.getItem(`conteos_diarios_${user.id}`),
        );
        const diarios =
          savedDiarios?.fecha === today
            ? savedDiarios.conteos
            : Object.fromEntries(data.map((v) => [v.id, 0]));
        setConteosDiarios(diarios);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekKey = startOfWeek.toISOString().split("T")[0];
        const savedSemanales = JSON.parse(
          localStorage.getItem(`conteos_semanales_${user.id}`),
        );
        const semanales =
          savedSemanales?.fecha === weekKey
            ? savedSemanales.conteos
            : Object.fromEntries(data.map((v) => [v.id, 0]));
        setConteosSemanales(semanales);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar volantes:", err);
        setLoading(false);
      }
    }

    fetchVolantes();
  }, [user, setCantidadVolantes]);

  // 🔹 Guardar conteos diarios
  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      `conteos_diarios_${user.id}`,
      JSON.stringify({ fecha: today, conteos: conteosDiarios }),
    );
    setTotalHoy(Object.values(conteosDiarios).reduce((a, b) => a + b, 0));
  }, [conteosDiarios, user, setTotalHoy]);

  // 🔹 Guardar conteos semanales
  useEffect(() => {
    if (!user?.id) return;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekKey = startOfWeek.toISOString().split("T")[0];
    localStorage.setItem(
      `conteos_semanales_${user.id}`,
      JSON.stringify({ fecha: weekKey, conteos: conteosSemanales }),
    );
    setTotalSemana(Object.values(conteosSemanales).reduce((a, b) => a + b, 0));
  }, [conteosSemanales, user, setTotalSemana]);

  const registrarImpresion = async (volanteId, cantidad = 1) => {
    if (!user?.id) return;
    try {
      await axios.post("http://localhost:8000/impresiones/", {
        usuario_id: user.id,
        catalogo_id: volanteId,
        fecha: new Date().toISOString().split("T")[0],
        cantidad_impresa: cantidad,
      });
    } catch (error) {
      console.error("Error registrando la impresión:", error);
      alert("No se pudo registrar la impresión");
    }
  };

  const handleIncrementBadge = (volanteId, cantidad = 1) => {
    setConteosDiarios((prev) => ({
      ...prev,
      [volanteId]: (prev[volanteId] || 0) + cantidad,
    }));
    setConteosSemanales((prev) => ({
      ...prev,
      [volanteId]: (prev[volanteId] || 0) + cantidad,
    }));
    setHaySeleccion(true);
  };

  const handleDecrement = (volanteId) => {
    const currentDiario = conteosDiarios[volanteId] || 0;
    const currentSemanal = conteosSemanales[volanteId] || 0;
    if (currentDiario === 0) return;
    setConteosDiarios({ ...conteosDiarios, [volanteId]: currentDiario - 1 });
    setConteosSemanales({
      ...conteosSemanales,
      [volanteId]: currentSemanal - 1,
    });
    setAnimarBadge((prev) => ({ ...prev, [volanteId]: true }));
    setTimeout(
      () => setAnimarBadge((prev) => ({ ...prev, [volanteId]: false })),
      300,
    );
  };

  const totalHoy = Object.values(conteosDiarios).reduce((a, b) => a + b, 0);
  const totalSemana = Object.values(conteosSemanales).reduce(
    (a, b) => a + b,
    0,
  );
  const extraDiario =
    totalHoy > LIMITE_DIARIO ? (totalHoy - LIMITE_DIARIO) * COSTO_EXTRA : 0;
  const extraSemanal =
    totalSemana > LIMITE_SEMANAL
      ? (totalSemana - LIMITE_SEMANAL) * COSTO_EXTRA
      : 0;
  const costoExtraModal = extraDiario + extraSemanal;

  if (loading) return <p className="p-4">Cargando volantes...</p>;
  if (!volantes.length)
    return <p className="p-4">No tienes volantes asignados.</p>;

  return (
    <>
      {/* Botón Imprimir */}
      <div className="p-4 flex justify-center">
        <button
          disabled={!haySeleccion}
          onClick={() => setShowConfirm(true)}
          className={`px-4 py-2 rounded-lg ${
            haySeleccion
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          🖨️ Imprimir seleccionadas
        </button>
      </div>

      {/* Cards Volantes */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {volantes.map((volante) => {
          const estaExtra =
            conteosDiarios[volante.id] > LIMITE_DIARIO ||
            conteosSemanales[volante.id] > LIMITE_SEMANAL;
          const isPDF = volante.nombre.toLowerCase().endsWith(".pdf");
          const fileUrl = `http://localhost:8000${volante.url}`;

          return (
            <div
              key={volante.id}
              className={`relative rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105 cursor-pointer ${
                darkMode
                  ? "bg-gray-800 border border-gray-700 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {/* Badge de conteo */}
              <span
                className={`absolute top-2 right-2 text-sm font-bold px-2 py-1 rounded-full z-10 flex items-center justify-center transition-all duration-300 transform ${
                  estaExtra ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                } ${animarBadge[volante.id] ? "scale-125" : "scale-100"}`}
              >
                {conteosDiarios[volante.id]}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrement(volante.id);
                  }}
                  className="ml-2 text-red-300 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </span>

              {/* Contenido PDF / Imagen */}
              {isPDF ? (
                <div className="w-full h-80 sm:h-96 md:h-96 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <p className="text-center text-sm mb-2">
                    Previsualización PDF
                  </p>
                  <iframe
                    src={fileUrl}
                    className="w-full h-full object-cover"
                    title={volante.nombre}
                    onClick={() => handleIncrementBadge(volante.id)}
                  />
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Abrir PDF
                  </a>
                </div>
              ) : (
                <img
                  src={fileUrl}
                  alt={volante.nombre}
                  className="w-full h-80 sm:h-96 md:h-96 object-cover"
                  onClick={() => handleIncrementBadge(volante.id)}
                />
              )}

              {/* Footer con nombre y botón Ampliar */}
              <div
                className={`p-5 text-center font-semibold text-lg ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {volante.nombre}
                <div className="mt-2">
                  <button
                    onClick={() => setModalVolante(volante)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Ampliar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ampliar */}
      {modalVolante && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-3xl rounded-xl shadow-xl overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-xl font-bold">{modalVolante.nombre}</h2>
              <button
                onClick={() => setModalVolante(null)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cerrar
              </button>
            </div>
            <div className="p-4">
              {modalVolante.nombre.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`http://localhost:8000${modalVolante.url}`}
                  className="w-full h-[70vh]"
                  title={modalVolante.nombre}
                />
              ) : (
                <img
                  src={`http://localhost:8000${modalVolante.url}`}
                  alt={modalVolante.nombre}
                  className="w-full h-[70vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Impresión */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div
            className={`w-full max-w-md rounded-xl p-6 shadow-xl text-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
          >
            <h2 className="text-xl font-bold mb-4">
              Confirmar Orden de Impresión
            </h2>

            <div className="mb-3 text-left">
              <p>
                Límite Diario: {totalHoy} / {LIMITE_DIARIO} (
                {((totalHoy / LIMITE_DIARIO) * 100).toFixed(1)}%)
              </p>
              <p>
                Límite Semanal: {totalSemana} / {LIMITE_SEMANAL} (
                {((totalSemana / LIMITE_SEMANAL) * 100).toFixed(1)}%)
              </p>
              <p>Costo por página extra: ${costoExtraModal.toFixed(2)}</p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={async () => {
                  for (const volante of volantes) {
                    const cantidad = conteosDiarios[volante.id] || 0;
                    if (cantidad > 0)
                      await registrarImpresion(volante.id, cantidad);
                  }
                  alert("✅ Impresión confirmada");
                  setShowConfirm(false);

                  const resetDiarios = {};
                  const resetSemanales = {};
                  volantes.forEach((v) => {
                    resetDiarios[v.id] = 0;
                    resetSemanales[v.id] = 0;
                  });
                  setConteosDiarios(resetDiarios);
                  setConteosSemanales(resetSemanales);
                  setHaySeleccion(false);
                  if (onConfirmarImpresion) {
                    await onConfirmarImpresion();
                  }
                }}
              >
                Confirmar Impresión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
