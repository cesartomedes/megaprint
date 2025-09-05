import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/categorias/");
      setCategorias(res.data);
    } catch (err) {
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAdd = async () => {
    if (!nuevoNombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/categorias/", {
        nombre: nuevoNombre,
      });
      toast.success("Categoría agregada");
      setNuevoNombre("");
      fetchCategorias();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al agregar categoría");
    }
  };

  const handleDelete = async (cat) => {
    const confirm = window.confirm(
      `¿Estás seguro de eliminar la categoría "${cat.nombre}"?`
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/categorias/${cat.id}`);
      toast.success("Categoría eliminada");
      fetchCategorias();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al eliminar categoría");
    }
  };

  return (
    <div className="text-gray-900 dark:text-white transition-colors duration-300">
      <Toaster position="top-right" />
      <h2 className="text-xl font-bold mb-4">Categorías</h2>

      {/* Formulario para agregar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="border p-2 rounded flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar
        </button>
      </div>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : categorias.length === 0 ? (
        <p>No hay categorías disponibles.</p>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-200 dark:border-gray-600">
                <td className="py-2 px-4">{cat.id}</td>
                <td className="py-2 px-4">{cat.nombre}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleDelete(cat)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
