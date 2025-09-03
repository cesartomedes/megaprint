import React, { useState } from "react";
import { Edit, Trash2, PlusCircle } from "lucide-react";

export default function CategoriasTab() {
  // Estado inicial de categorías
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: "Catálogos", descripcion: "Catálogos de productos y servicios", creada: "8/22/2025", activa: true },
    { id: 2, nombre: "Formularios", descripcion: "Formularios diversos", creada: "8/22/2025", activa: true },
    { id: 3, nombre: "Manuales", descripcion: "Manuales de uso y documentación", creada: "8/22/2025", activa: true },
    { id: 4, nombre: "Marketing", descripcion: "Material promocional y publicitario", creada: "8/22/2025", activa: true },
    { id: 5, nombre: "Precios", descripcion: "Listas de precios y tarifas", creada: "8/22/2025", activa: true },
    { id: 6, nombre: "Promociones", descripcion: "Ofertas y promociones especiales", creada: "8/22/2025", activa: true },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");

  // Agregar nueva categoría
  const agregarCategoria = () => {
    if (!nuevoNombre) return;
    const nueva = {
      id: Date.now(),
      nombre: nuevoNombre,
      descripcion: nuevoDescripcion || "Sin descripción",
      creada: new Date().toLocaleDateString(),
      activa: true,
    };
    setCategorias([nueva, ...categorias]);
    setNuevoNombre("");
    setNuevoDescripcion("");
  };

  // Borrar categoría
  const borrarCategoria = (id) => {
    setCategorias(categorias.filter((cat) => cat.id !== id));
  };

  // Alternar estado activo
  const toggleActivo = (id) => {
    setCategorias(
      categorias.map((cat) =>
        cat.id === id ? { ...cat, activa: !cat.activa } : cat
      )
    );
  };

  return (
    <div>
      {/* Formulario agregar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre categoría"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoDescripcion}
          onChange={(e) => setNuevoDescripcion(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={agregarCategoria}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Agregar
        </button>
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white shadow rounded-2xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Creada</th>
              <th className="px-4 py-2">Activa</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-b">
                <td className="px-4 py-2">{cat.nombre}</td>
                <td className="px-4 py-2">{cat.descripcion}</td>
                <td className="px-4 py-2">{cat.creada}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={cat.activa}
                    onChange={() => toggleActivo(cat.id)}
                  />
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => alert("Aquí podrías abrir un modal para editar")}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => borrarCategoria(cat.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No hay categorías
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
