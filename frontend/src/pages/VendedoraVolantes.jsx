// VendedoraVolantes.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraVolantes({
  darkMode,
  setCantidadVolantes,
  setTotalHoy,
  setTotalSemana,
  setCostoExtra,
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

  const LIMITE_DIARIO = 30;
  const LIMITE_SEMANAL = 30 * 4;
  const COSTO_EXTRA = 0.5;

  // 🔹 Fetch y carga inicial
  useEffect(() => {
    if (!user || !user.id) return;

    async function fetchVolantes() {
      try {
        const res = await axios.get(
          `http://localhost:8000/catalogos/vendedora/${user.id}`
        );
        const data = res.data;
        setVolantes(data);
        setCantidadVolantes(data.length);

        // 🔹 Cargar conteos diarios desde localStorage
        const today = new Date().toISOString().split("T")[0];
        const savedDiarios = JSON.parse(
          localStorage.getItem(`conteos_diarios_${user.id}`)
        );
        let diarios = {};
        if (savedDiarios && savedDiarios.fecha === today) {
          diarios = savedDiarios.conteos;
        } else {
          data.forEach((v) => (diarios[v.id] = 0));
        }
        setConteosDiarios(diarios);

        // 🔹 Cargar conteos semanales desde localStorage
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekKey = startOfWeek.toISOString().split("T")[0];
        const savedSemanales = JSON.parse(
          localStorage.getItem(`conteos_semanales_${user.id}`)
        );
        let semanales = {};
        if (savedSemanales && savedSemanales.fecha === weekKey) {
          semanales = savedSemanales.conteos;
        } else {
          data.forEach((v) => (semanales[v.id] = 0));
        }
        setConteosSemanales(semanales);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar volantes:", err);
        setLoading(false);
      }
    }

    fetchVolantes();
  }, [user, setCantidadVolantes]);

  // 🔹 Guardar diarios en localStorage cada vez que cambian
  useEffect(() => {
    if (!user || !user.id) return;
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      `conteos_diarios_${user.id}`,
      JSON.stringify({ fecha: today, conteos: conteosDiarios })
    );

    const totalHoyActual = Object.values(conteosDiarios).reduce((a, b) => a + b, 0);
    setTotalHoy(totalHoyActual);
  }, [conteosDiarios, user, setTotalHoy]);

  // 🔹 Guardar semanales en localStorage cada vez que cambian
  useEffect(() => {
    if (!user || !user.id) return;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekKey = startOfWeek.toISOString().split("T")[0];
    localStorage.setItem(
      `conteos_semanales_${user.id}`,
      JSON.stringify({ fecha: weekKey, conteos: conteosSemanales })
    );

    const totalSemanaActual = Object.values(conteosSemanales).reduce((a, b) => a + b, 0);
    setTotalSemana(totalSemanaActual);
  }, [conteosSemanales, user, setTotalSemana]);

  // 🔹 Registrar impresión en backend
  const registrarImpresion = async (volanteId, cantidad = 1) => {
    if (!user || !user.id) return;
    try {
      const res = await axios.post("http://localhost:8000/impresiones/", {
        usuario_id: user.id,
        volante_id: volanteId,
        fecha: new Date().toISOString().split("T")[0],
        cantidad_impresa: cantidad,
      });
      return res.data;
    } catch (error) {
      console.error("Error registrando la impresión:", error);
      alert("No se pudo registrar la impresión");
    }
  };

  const handleIncrement = async (volanteId, cantidad = 1) => {
    if (!user || !user.id) return;

    const impresionRegistrada = await registrarImpresion(volanteId, cantidad);
    if (!impresionRegistrada) return;

    setConteosDiarios((prev) => ({ ...prev, [volanteId]: (prev[volanteId] || 0) + cantidad }));
    setConteosSemanales((prev) => ({ ...prev, [volanteId]: (prev[volanteId] || 0) + cantidad }));
    setHaySeleccion(true);
  };

  const handleDecrement = (volanteId) => {
    const currentDiario = conteosDiarios[volanteId] || 0;
    const currentSemanal = conteosSemanales[volanteId] || 0;
    if (currentDiario === 0) return;

    const newDiarios = { ...conteosDiarios, [volanteId]: currentDiario - 1 };
    const newSemanales = { ...conteosSemanales, [volanteId]: currentSemanal - 1 };
    setConteosDiarios(newDiarios);
    setConteosSemanales(newSemanales);

    setAnimarBadge((prev) => ({ ...prev, [volanteId]: true }));
    setTimeout(() => setAnimarBadge((prev) => ({ ...prev, [volanteId]: false })), 300);
  };

  if (loading) return <p className="p-4">Cargando volantes...</p>;
  if (!volantes.length) return <p className="p-4">No tienes volantes asignados.</p>;

  const totalHoy = Object.values(conteosDiarios).reduce((a, b) => a + b, 0);
  const totalSemana = Object.values(conteosSemanales).reduce((a, b) => a + b, 0);
  const costoExtraModal =
    (totalHoy > LIMITE_DIARIO ? (totalHoy - LIMITE_DIARIO) * COSTO_EXTRA : 0) +
    (totalSemana > LIMITE_SEMANAL ? (totalSemana - LIMITE_SEMANAL) * COSTO_EXTRA : 0);

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

      {/* Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {volantes.map((volante) => {
          const estaExtra =
            conteosDiarios[volante.id] > LIMITE_DIARIO ||
            conteosSemanales[volante.id] > LIMITE_SEMANAL;

          return (
            <div
              key={volante.id}
              className={`relative rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105 cursor-pointer ${
                darkMode
                  ? "bg-gray-800 border border-gray-700 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
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

              {volante.nombre.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`http://localhost:8000${volante.url}`}
                  className="w-full h-80 sm:h-96 md:h-96 object-cover"
                  title={volante.nombre}
                  onClick={() => handleIncrement(volante.id)}
                />
              ) : (
                <img
                  src={`http://localhost:8000${volante.url}`}
                  alt={volante.nombre}
                  className="w-full h-80 sm:h-96 md:h-96 object-cover"
                  onClick={() => handleIncrement(volante.id)}
                />
              )}

              <div
                className={`p-5 text-center font-semibold text-lg ${
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {volante.nombre}
                <div className="mt-2">
                  <button
                    onClick={() => setModalVolante(volante)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Toque para ampliar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Volante */}
      {modalVolante && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/70 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg relative max-w-4xl w-full">
            <button
              onClick={() => setModalVolante(null)}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full px-3 py-1 hover:bg-red-600"
            >
              X
            </button>
            {modalVolante.nombre.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`http://localhost:8000${modalVolante.url}`}
                className="w-full h-[80vh]"
                title={modalVolante.nombre}
              />
            ) : (
              <img
                src={`http://localhost:8000${modalVolante.url}`}
                alt={modalVolante.nombre}
                className="w-full h-[80vh] object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal Confirmar Impresión */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div
            className={`w-full max-w-md rounded-xl p-6 shadow-xl text-center ${
              darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Confirmar Orden de Impresión</h2>
            <p className="font-semibold mb-2">Archivos Seleccionados</p>
            <p className="text-sm mb-4">(Resumen global)</p>
            <div className="mb-3">
              <p>
                Uso Diario: {totalHoy} / {LIMITE_DIARIO}
              </p>
              <p>
                Uso Semanal: {totalSemana} / {LIMITE_SEMANAL}
              </p>
            </div>
            {costoExtraModal > 0 ? (
              <p className="text-red-600 font-semibold mb-4">
                Costo adicional: ${costoExtraModal.toFixed(2)}
              </p>
            ) : (
              <p className="text-green-600 font-semibold mb-4">
                Sin costo adicional. Esta impresión está dentro de tus límites gratuitos.
              </p>
            )}
            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  alert("✅ Impresión confirmada");
                  setShowConfirm(false);

                  // 🔹 Reiniciar conteos locales
                  const resetDiarios = {};
                  const resetSemanales = {};
                  volantes.forEach((v) => {
                    resetDiarios[v.id] = 0;
                    resetSemanales[v.id] = 0;
                  });
                  setConteosDiarios(resetDiarios);
                  setConteosSemanales(resetSemanales);
                  if (setCostoExtra) setCostoExtra(0);
                  setHaySeleccion(false);
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
