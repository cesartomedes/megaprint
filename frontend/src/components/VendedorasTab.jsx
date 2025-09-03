import React, { useState, useEffect } from "react";
import axios from "axios";

export default function VendedorasTab() {
  const [vendedoras, setVendedoras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendedoras = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8000/vendedoras"); // endpoint que devuelve solo aprobadas
        setVendedoras(res.data);
      } catch (err) {
        console.error("Error al cargar vendedoras:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendedoras();
  }, []);

  if (loading) return <p>Cargando vendedoras...</p>;
  if (vendedoras.length === 0) return <p>No hay vendedoras aprobadas.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendedoras.map((v) => (
        <div key={v.id} className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold">{v.nombre}</h3>
          <p>Email: {v.email}</p>
          <p>Estado: {v.estado}</p>
        </div>
      ))}
    </div>
  );
}
