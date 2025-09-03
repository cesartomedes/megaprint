import React, { useEffect, useState } from "react";
import axios from "axios";
import PDFDetalle from "./PDFDetalle";
import PDFForm from "./PDFForm";

export default function CatalogoVendedora({ vendedora, goBack }) {
  const [pdfs, setPdfs] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/catalogos/vendedora/${vendedora.id}`);
      setPdfs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  if (loading) return <p>Cargando catálogo...</p>;
  if (detalle)
    return <PDFDetalle pdf={detalle} goBack={() => setDetalle(null)} refresh={fetchPdfs} />;

  return (
    <div>
      <button className="mb-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={goBack}>
        Volver a vendedoras
      </button>
      <h2 className="text-xl font-bold mb-4">Catálogo de {vendedora.nombre}</h2>
      <PDFForm refresh={fetchPdfs} vendedoraId={vendedora.id} />
      {pdfs.length === 0 ? (
        <p>No hay PDFs disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white shadow p-4 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setDetalle(pdf)}
            >
              <p className="font-semibold">{pdf.nombre}</p>
              <p>{pdf.paginas} páginas</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
