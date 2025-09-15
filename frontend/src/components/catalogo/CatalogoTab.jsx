import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CatalogoTab() {
  const [vendedoras, setVendedoras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [nombrePdf, setNombrePdf] = useState("");
  const [categoria, setCategoria] = useState("");

  // --- Fetchers ---
  const fetchVendedoras = async () => {
    try {
      const { data } = await axios.get(
        "http://127.0.0.1:8000/admin/vendedoras",
      );
      setVendedoras(data);
    } catch {
      toast.error("Error al cargar vendedoras");
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/categorias");
      setCategorias(data);
    } catch {
      toast.error("Error al cargar categorías");
    }
  };

  const fetchPdfs = async (vendedoraId = null) => {
    try {
      setLoading(true);
      const url = vendedoraId
        ? `http://127.0.0.1:8000/catalogos/vendedora/${vendedoraId}`
        : "http://127.0.0.1:8000/catalogos/general";
      const { data } = await axios.get(url);
      setPdfs(data);
    } catch {
      toast.error("Error al cargar catálogo");
    } finally {
      setLoading(false);
    }
  };

  // --- Lifecycle ---
  useEffect(() => {
    fetchVendedoras();
    fetchCategorias();
    fetchPdfs();
  }, []);

  // --- Handlers ---
  const seleccionarVendedora = (v) => {
    setVendedoraSeleccionada(v);
    fetchPdfs(v.id);
  };

  const volverAGeneral = () => {
    setVendedoraSeleccionada(null);
    fetchPdfs();
  };

  const handleSubirPdf = async () => {
    console.log("Vendedora ID:", vendedoraSeleccionada?.id);
    if (!archivo || !nombrePdf || !categoria) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      setSubiendo(true);
      const formData = new FormData();
      formData.append("file", archivo);
      formData.append("nombre", nombrePdf);
      formData.append("categoria_id", categoria);
      if (vendedoraSeleccionada) {
        formData.append("vendedora_id", vendedoraSeleccionada.id);
      }

      await axios.post("http://127.0.0.1:8000/catalogos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("PDF subido correctamente");
      setNombrePdf("");
      setArchivo(null);
      setCategoria("");
      fetchPdfs(vendedoraSeleccionada?.id || null);
    } catch (err) {
      console.error("Error al subir PDF:", err);
      toast.error("Error al subir PDF");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (pdfId, pdfNombre) => {
    if (!window.confirm(`¿Eliminar "${pdfNombre}"?`)) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/catalogos/${pdfId}`);
      toast.success("PDF eliminado..");
      fetchPdfs(vendedoraSeleccionada?.id || null);
    } catch {
      toast.error("Error al eliminar PDF");
    }
  };

  // --- Render ---
  if (loading)
    return (
      <p className="text-gray-500 dark:text-gray-300">Cargando catálogo...</p>
    );

  return (
    <div className="space-y-6 text-gray-900 dark:text-white transition-colors duration-300">
      <Toaster position="top-right" />

      {/* Selección de vendedora */}
      <div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
          Catálogo por Vendedora
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-full border transition ${
              !vendedoraSeleccionada
                ? "bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            }`}
            onClick={volverAGeneral}
          >
            Catálogo General
          </button>
          {vendedoras.map((v) => (
            <button
              key={v.id}
              className={`px-4 py-2 rounded-full transition ${
                vendedoraSeleccionada?.id === v.id
                  ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600"
              }`}
              onClick={() => seleccionarVendedora(v)}
            >
              {v.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-white">
          {vendedoraSeleccionada
            ? `Catálogo de ${vendedoraSeleccionada.nombre}`
            : "Catálogo General"}
        </h2>

        {pdfs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">
            No hay PDFs disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                    {pdf.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Categoría: {pdf.categoria || "-"}
                  </p>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">
                    {pdf.vendedora_id
                      ? `Asignado a vendedora`
                      : "Asignado al catálogo general"}
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <a
                    href={`http://127.0.0.1:8000${pdf.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Ver PDF
                  </a>
                  <button
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    onClick={() => handleEliminar(pdf.id, pdf.nombre)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subida de PDF */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-2xl shadow p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
          Agregar PDF{" "}
          {vendedoraSeleccionada
            ? `para ${vendedoraSeleccionada.nombre}`
            : "(Catálogo General)"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del PDF"
            value={nombrePdf}
            onChange={(e) => setNombrePdf(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))
            ) : (
              <option disabled>No hay categorías disponibles</option>
            )}
          </select>
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="col-span-1 sm:col-span-2 text-gray-900 dark:text-white"
          />
        </div>
        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={handleSubirPdf}
          disabled={subiendo}
        >
          {subiendo
            ? "Subiendo..."
            : vendedoraSeleccionada
              ? `Agregar PDF a ${vendedoraSeleccionada.nombre}`
              : "Agregar PDF al Catálogo General"}
        </button>
      </div>
    </div>
  );
}
