import React, { useState } from "react";
import axios from "axios";

export default function PDFForm({ vendedoraId, refresh }) {
  const [file, setFile] = useState(null);
  const [nombre, setNombre] = useState("");
  const [paginas, setPaginas] = useState(1);
  const [color, setColor] = useState("Color");
  const [tamano, setTamano] = useState("A4");
  const [version, setVersion] = useState("1.0");
  const [categoria, setCategoria] = useState("Catálogos");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un PDF");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("nombre", nombre);
    formData.append("paginas", paginas);
    formData.append("color", color);
    formData.append("tamano", tamano);
    formData.append("version", version);
    formData.append("categoria", categoria);
    formData.append("vendedora_id", vendedoraId);

    try {
      await axios.post("http://127.0.0.1:8000/catalogos/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      refresh();
      setFile(null);
      setNombre("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Nombre del PDF"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="border p-2 rounded mr-2"
        required
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 rounded mr-2"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Agregar PDF
      </button>
    </form>
  );
}
