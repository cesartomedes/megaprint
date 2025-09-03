import React, { useState } from "react";

export default function PagosTab() {
  // Datos simulados
  const [vendedorasDeuda] = useState([
    { id: 1, nombre: "Raúl Leon", email: "raulleon115599@gmail.com", deuda: 63, ultimaActualizacion: "8/25/2025" },
    { id: 2, nombre: "Mega Fibra", email: "megafibrave@gmail.com", deuda: 63, ultimaActualizacion: "8/25/2025" },
    { id: 3, nombre: "Mega Fibra", email: "megafibrave@gmail.com", deuda: 63, ultimaActualizacion: "8/25/2025" },
  ]);

  const [historialPagos] = useState([
    { id: 1, monto: 333, metodo: "transferencia", referencia: "3333", notas: "33", fecha: "8/26/2025 10:37:43 AM", completado: true }
  ]);

  const [detalleVendedora, setDetalleVendedora] = useState(null);

  // Total y promedio
  const totalDeuda = vendedorasDeuda.reduce((acc, v) => acc + v.deuda, 0);
  const promedio = vendedorasDeuda.length ? totalDeuda / vendedorasDeuda.length : 0;

  return (
    <div>
      {!detalleVendedora ? (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <p className="text-gray-500">Total</p>
              <p className="text-lg font-bold">${totalDeuda.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <p className="text-gray-500">Vendedoras con Deuda</p>
              <p className="text-lg font-bold">{vendedorasDeuda.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <p className="text-gray-500">Promedio por Vendedora</p>
              <p className="text-lg font-bold">${promedio.toFixed(2)}</p>
            </div>
          </div>

          {/* Lista de vendedoras con deuda */}
          <div className="bg-white shadow rounded-2xl p-4">
            <h3 className="font-bold mb-2">Vendedoras con Deuda Pendiente</h3>
            {vendedorasDeuda.map((v) => (
              <div key={v.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{v.nombre}</p>
                  <p className="text-gray-500 text-sm">{v.email}</p>
                  <p className="text-gray-500 text-sm">Última actualización: {v.ultimaActualizacion}</p>
                  <p className="text-gray-500 text-sm">Deuda pendiente: ${v.deuda.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setDetalleVendedora(v)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Vista detalle */}
          <button
            onClick={() => setDetalleVendedora(null)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded mb-4 hover:bg-gray-400"
          >
            Volver
          </button>

          <div className="bg-white shadow rounded-2xl p-4 mb-6">
            <p className="font-bold text-lg">{detalleVendedora.nombre}</p>
            <p className="text-gray-500">{detalleVendedora.email}</p>
            <p className="text-gray-500">Deuda Actual: ${detalleVendedora.deuda.toFixed(2)}</p>
            <p className="text-gray-500">Última actualización: {detalleVendedora.ultimaActualizacion}</p>
          </div>

          {/* Historial de pagos */}
          <div className="bg-white shadow rounded-2xl p-4">
            <h3 className="font-bold mb-2">Historial de Pagos</h3>
            {historialPagos.map((pago) => (
              <div key={pago.id} className="border-b py-2">
                <p>Monto: ${pago.monto}</p>
                <p>Método: {pago.metodo}</p>
                <p>Referencia: {pago.referencia}</p>
                <p>Notas: {pago.notas}</p>
                <p>Fecha: {pago.fecha}</p>
                <p>Completado: {pago.completado ? "Sí" : "No"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
