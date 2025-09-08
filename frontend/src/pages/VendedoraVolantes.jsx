import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function VendedoraVolantes({
  darkMode,
  setCantidadVolantes,
  setTotalHoy,
  setTotalSemana,
}) {
  const { user } = useContext(AuthContext);
  const [volantes, setVolantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conteosDiarios, setConteosDiarios] = useState({});
  const [conteosSemanales, setConteosSemanales] = useState({});
  const [modalVolante, setModalVolante] = useState(null);

  const LIMITE_DIARIO = 30;
  const LIMITE_SEMANAL = 30 * 4; // ejemplo 4 días

  const getInicioSemana = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const LOCAL_STORAGE_KEY = `impresiones_${user.id}`;

    async function fetchVolantes() {
      try {
        const res = await axios.get(
          `http://localhost:8000/catalogos/vendedora/${user.id}`
        );
        const data = res.data;
        setVolantes(data);
        setCantidadVolantes(data.length);

        const hoy = new Date().toISOString().split("T")[0];
        const inicioSemana = getInicioSemana();

        let almacenado =
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};

        // Reinicio diario
        if (almacenado.fechaHoy !== hoy) {
          almacenado.fechaHoy = hoy;
          almacenado.conteosDiarios = data.map((v) => ({
            volanteId: v.id,
            cantidadImpresaHoy: 0,
          }));
        }

        // Reinicio semanal
        if (almacenado.fechaSemana !== inicioSemana) {
          almacenado.fechaSemana = inicioSemana;
          almacenado.conteosSemanales = data.map((v) => ({
            volanteId: v.id,
            cantidadImpresaSemana: 0,
          }));
        }

        // Inicializa estados
        const initialDiarios = {};
        const initialSemanales = {};
        data.forEach((v) => {
          initialDiarios[v.id] =
            almacenado.conteosDiarios?.find((i) => i.volanteId === v.id)
              ?.cantidadImpresaHoy || 0;
          initialSemanales[v.id] =
            almacenado.conteosSemanales?.find((i) => i.volanteId === v.id)
              ?.cantidadImpresaSemana || 0;
        });

        setConteosDiarios(initialDiarios);
        setConteosSemanales(initialSemanales);

        // Totales
        setTotalHoy(
          Object.values(initialDiarios).reduce((a, b) => a + b, 0)
        );
        setTotalSemana(
          Object.values(initialSemanales).reduce((a, b) => a + b, 0)
        );

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(almacenado));
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar volantes:", err);
        setLoading(false);
      }
    }

    fetchVolantes();
  }, [user, setCantidadVolantes, setTotalHoy, setTotalSemana]);

  const handleIncrement = (volanteId) => {
    if (!user || !user.id) return;
    const LOCAL_STORAGE_KEY = `impresiones_${user.id}`;
    let almacenado = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};

    const totalHoy = Object.values(conteosDiarios).reduce((a, b) => a + b, 0);
    const totalSemana = Object.values(conteosSemanales).reduce(
      (a, b) => a + b,
      0
    );

    if (totalHoy >= LIMITE_DIARIO) {
      alert("¡Has alcanzado el límite diario!");
      return;
    }
    if (totalSemana >= LIMITE_SEMANAL) {
      alert("¡Has alcanzado el límite semanal!");
      return;
    }

    // Incrementar diarios
    setConteosDiarios((prev) => {
      const newDiarios = { ...prev, [volanteId]: prev[volanteId] + 1 };
      setTotalHoy(Object.values(newDiarios).reduce((a, b) => a + b, 0));
      return newDiarios;
    });

    // Incrementar semanales
    setConteosSemanales((prev) => {
      const newSemanales = { ...prev, [volanteId]: prev[volanteId] + 1 };
      setTotalSemana(Object.values(newSemanales).reduce((a, b) => a + b, 0));
      return newSemanales;
    });

    // Guardar en localStorage
    if (almacenado.conteosDiarios) {
      const idx = almacenado.conteosDiarios.findIndex(
        (i) => i.volanteId === volanteId
      );
      if (idx !== -1) almacenado.conteosDiarios[idx].cantidadImpresaHoy += 1;
    }
    if (almacenado.conteosSemanales) {
      const idx = almacenado.conteosSemanales.findIndex(
        (i) => i.volanteId === volanteId
      );
      if (idx !== -1)
        almacenado.conteosSemanales[idx].cantidadImpresaSemana += 1;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(almacenado));
  };

  if (loading) return <p className="p-4">Cargando volantes...</p>;
  if (!volantes.length)
    return <p className="p-4">No tienes volantes asignados.</p>;

  return (
    <>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {volantes.map((volante) => (
          <div
            key={volante.id}
            className={`relative rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105 cursor-pointer ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={() => handleIncrement(volante.id)}
          >
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-full z-10">
              {conteosDiarios[volante.id]}
            </span>

            {volante.nombre.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`http://localhost:8000${volante.url}`}
                className="w-full h-80 sm:h-96 md:h-96 object-cover"
                title={volante.nombre}
              />
            ) : (
              <img
                src={`http://localhost:8000${volante.url}`}
                alt={volante.nombre}
                className="w-full h-80 sm:h-96 md:h-96 object-cover"
              />
            )}

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
                  Toque para ampliar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVolante && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
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
    </>
  );
}
