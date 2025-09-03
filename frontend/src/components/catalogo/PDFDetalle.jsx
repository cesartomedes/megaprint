import React from "react";
import axios from "axios";

export default function PDFDetalle({ pdf, goBack, refresh }) {
  const eliminar = async () => {
    if (window.confirm(`¿Estás seguro de eliminar "${pdf.nombre}"?`)) {
      try {
        await axios.delete(`http://127.0.0.1:8000/catalogos/pdf/${pdf.id}`);
        refresh();
        goBack();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <button
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
        onClick={goBack}
      >
        Volver
      </button>
      <h2 className="text-xl font-bold mb-2">{pdf.nombre}</h2>
      <p>Páginas: {pdf.paginas}</p>
      <p>Color: {pdf.color}</p>
      <p>Tamaño: {pdf.tamano}</p>
      <p>Versión: {pdf.version}</p>
      <p>Categoría: {pdf.categoria}</p>
      <button
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        onClick={eliminar}
      >
        Eliminar PDF
      </button>
    </div>
  );
}
