import { useState } from "react";

export default function RegisterForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "vendedora",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="username"
        placeholder="Usuario"
        value={formData.username}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="vendedora">Vendedora</option>
        <option value="admin">Administrador</option>
      </select>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Registrarse
      </button>
    </form>
  );
}
