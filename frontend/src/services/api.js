const API_URL = "http://localhost:8000";

export async function fetchVendedoras() {
  const response = await fetch(`${API_URL}/vendedoras`);
  if (!response.ok) throw new Error("Error al cargar vendedoras");
  return response.json();
}

export async function fetchPagos() {
  const response = await fetch(`${API_URL}/pagos`);
  if (!response.ok) throw new Error("Error al cargar pagos");
  return response.json();
}


