import React, { useState, useEffect } from "react";

export default function VendedoraDeudas({
  deudas = [],
  onRegistrarPago,
  excesoDiario = 0,
  excesoSemanal = 0,
  autoOpenModal = false,
  setAutoOpenModal,
  costoExcedente = 0.5, // valor por defecto
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [formData, setFormData] = useState({
    banco: "",
    referencia: "",
    comprobante: null,
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const bancos = ["Banesco", "Provincial", "Mercantil", "Venezuela"];

  // Generar deuda temporal por exceso
  const deudaExceso =
    excesoDiario + excesoSemanal > 0
      ? {
          id: "EXC-" + Date.now(),
          monto: (excesoDiario + excesoSemanal) * costoExcedente,
          estado: "pendiente",
          fecha: new Date().toISOString(),
          tipo: "Exceso de impresión",
        }
      : null;

  // Abrir modal automáticamente si hay exceso
  useEffect(() => {
    if (autoOpenModal && deudaExceso) {
      setSelectedDeuda(deudaExceso);
      setModalOpen(true);
      if (setAutoOpenModal) setAutoOpenModal(false);
    }
  }, [autoOpenModal, deudaExceso]);

  const openModal = (deuda) => {
    setSelectedDeuda(deuda);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ banco: "", referencia: "", comprobante: null });
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeuda) return;

    setLoading(true);
    setMensaje(null);

    const payload = new FormData();
    payload.append("deuda_id", selectedDeuda.id);
    payload.append("banco", formData.banco);
    payload.append("referencia", formData.referencia);
    if (formData.comprobante) {
      payload.append("comprobante", formData.comprobante);
    }

    try {
      await onRegistrarPago(payload);
      setMensaje({ tipo: "success", texto: "Pago registrado correctamente ✅" });
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al registrar el pago ❌" });
    } finally {
      setLoading(false);
    }
  };

  const allDeudas = deudaExceso ? [deudaExceso, ...deudas] : deudas;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 transition-colors duration-300">
      <h3 className="font-bold mb-4 text-2xl text-gray-800 dark:text-white">
        Mis Deudas
      </h3>

      {allDeudas.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          No tienes deudas pendientes 🎉
        </p>
      ) : (
        <div className="space-y-4">
          {/* Tabla para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {["ID", "Monto", "Tipo", "Estado", "Fecha", "Acción"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-2 border font-medium text-gray-700 dark:text-white"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {allDeudas.map((deuda) => (
                  <tr
                    key={deuda.id}
                    className="even:bg-gray-50 dark:even:bg-gray-900"
                  >
                    <td className="px-2 py-1 border text-gray-800 dark:text-white">
                      {deuda.id}
                    </td>
                    <td className="px-2 py-1 border font-semibold text-gray-800 dark:text-white">
                      ${deuda.monto.toFixed(2)}
                    </td>
                    <td className="px-2 py-1 border text-gray-800 dark:text-white">
                      {deuda.tipo || "General"}
                    </td>
                    <td className="px-2 py-1 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          deuda.estado === "pendiente"
                            ? "bg-red-500 text-white"
                            : deuda.estado === "pendiente_verificacion"
                            ? "bg-yellow-500 text-black"
                            : deuda.estado === "pagado"
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {deuda.estado}
                      </span>
                    </td>
                    <td className="px-2 py-1 border text-gray-800 dark:text-white">
                      {new Date(deuda.fecha).toLocaleString("es-VE")}
                    </td>
                    <td className="px-2 py-1 border text-center">
                      {deuda.estado === "pendiente" && (
                        <button
                          onClick={() => openModal(deuda)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Subir comprobante
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móviles */}
          <div className="md:hidden space-y-3">
            {allDeudas.map((deuda) => (
              <div
                key={deuda.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-sm"
              >
                <p className="text-gray-800 dark:text-white font-semibold">
                  ID: {deuda.id}
                </p>
                <p className="text-gray-800 dark:text-white font-semibold">
                  Monto: ${deuda.monto.toFixed(2)}
                </p>
                <p className="text-gray-800 dark:text-white">
                  Tipo: {deuda.tipo || "General"}
                </p>
                <p>
                  Estado:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      deuda.estado === "pendiente"
                        ? "bg-red-500 text-white"
                        : deuda.estado === "pendiente_verificacion"
                        ? "bg-yellow-500 text-black"
                        : deuda.estado === "pagado"
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {deuda.estado}
                  </span>
                </p>
                <p className="text-gray-800 dark:text-white">
                  Fecha: {new Date(deuda.fecha).toLocaleString("es-VE")}
                </p>
                {deuda.estado === "pendiente" && (
                  <button
                    onClick={() => openModal(deuda)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                  >
                    Subir comprobante
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedDeuda && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-md h-auto md:h-auto overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Subir comprobante - Deuda #{selectedDeuda.id}
            </h2>

            {mensaje && (
              <div
                className={`mb-3 p-2 rounded text-sm ${
                  mensaje.tipo === "success"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                value={formData.banco}
                onChange={(e) =>
                  setFormData({ ...formData, banco: e.target.value })
                }
                required
              >
                <option value="">Seleccione un banco</option>
                {bancos.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Número de referencia"
                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                value={formData.referencia}
                onChange={(e) =>
                  setFormData({ ...formData, referencia: e.target.value })
                }
                required
              />

              <input
                type="file"
                accept="image/*,.pdf"
                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, comprobante: e.target.files[0] })
                }
                required
              />

              <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
