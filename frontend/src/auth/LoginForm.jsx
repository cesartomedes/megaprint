import { useState } from "react";

export default function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // lo maneja el contenedor
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
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
