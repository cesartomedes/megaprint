import React, { useState } from "react";
import { Users, FileText } from "lucide-react";

export default function CatalogoTab() {
  // Datos temporales
  const catalogos = [
    {
      type: "general",
      title: "Catálogo General",
      pdfs: 1,
      users: [],
    },
    {
      type: "personal",
      title: "Raúl León",
      email: "raulleon115599@gmail.com",
      pdfs: 2,
      users: ["Raúl León"],
    },
    // Puedes agregar más vendedoras aquí
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {catalogos.map((cat) => (
        <div
          key={cat.title}
          className="bg-white shadow rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{cat.title}</h3>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          {cat.type === "personal" && (
            <p className="text-gray-500 text-sm">{cat.email}</p>
          )}
          <p className="text-gray-700 font-medium">{cat.pdfs} PDF{cat.pdfs > 1 && "s"}</p>
          <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Gestionar
          </button>
        </div>
      ))}
    </div>
  );
}
