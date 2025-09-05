const API_URL = "http://127.0.0.1:8000";

export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data), // { username, password }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al iniciar sesión");
  }

  return response.json(); // { msg, role, id }
}

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data), // { nombre, email, password }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al registrarse");
  }

  return response.json();
}
