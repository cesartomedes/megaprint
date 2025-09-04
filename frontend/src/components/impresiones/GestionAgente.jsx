import React from "react";

export default function GestionAgente({ agentInfo, setAgentInfo }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAgentInfo({ ...agentInfo, [name]: value });
  };

  const handleSave = () => {
    console.log("Agente guardado:", agentInfo);
    alert("Información del agente guardada!");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Gestión del Agente</h3>

      <div className="space-y-2">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={agentInfo.email}
          onChange={handleInputChange}
          className="border p-2 rounded-md w-full"
        />

        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          value={agentInfo.password}
          onChange={handleInputChange}
          className="border p-2 rounded-md w-full"
        />
      </div>

      <p className="mt-2"><b>Estado:</b> {agentInfo.estado}</p>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Guardar Agente
      </button>
    </div>
  );
}
