import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // usuario logueado

export default function VendedoraVolantes({ darkMode }) {
  const { user } = useContext(AuthContext);
  const [volantes, setVolantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conteos, setConteos] = useState({}); // {volanteId: conteo}

  useEffect(() => {
    async function fetchVolantes() {
      if (!user || !user.id) return;

      try {
        const res = await axios.get(
          `http://localhost:8000/catalogos/vendedora/${user.id}`
        );

        setVolantes(res.data);

        // Inicializar conteos
        const initialConteos = {};
        res.data.forEach((v) => {
          initialConteos[v.id] = 0;
        });
        setConteos(initialConteos);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar volantes:", err);
        setLoading(false);
      }
    }

    fetchVolantes();
  }, [user]);

  const handleClick = async (volanteId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/incrementar_conteo/${volanteId}`
      );
      setConteos((prev) => ({ ...prev, [volanteId]: res.data.conteo }));
    } catch (err) {
      console.error("Error al incrementar conteo:", err);
    }
  };

  if (loading) return <p className="p-4">Cargando volantes...</p>;
  if (!volantes.length)
    return <p className="p-4">No tienes volantes asignados.</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {volantes.map((volante) => (
        <div
          key={volante.id}
          className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition transform hover:scale-105 ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={() => handleClick(volante.id)}
        >
          {/* Contador */}
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {conteos[volante.id]}
          </span>

          {/* Preview de PDF o imagen */}
          {volante.nombre.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={`http://localhost:8000${volante.url}`}
              className="w-full h-80 sm:h-96 md:h-96 object-cover"
              title={volante.nombre}
            ></iframe>
          ) : (
            <img
              src={`http://localhost:8000${volante.url}`}
              alt={volante.nombre}
              className="w-full h-80 sm:h-96 md:h-96 object-cover"
            />
          )}

          {/* Nombre */}
          <div
            className={`p-5 text-center font-semibold text-lg ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            {volante.nombre}
          </div>
        </div>
      ))}
    </div>
  );
}
