import React, { useEffect, useState } from "react";

export default function TrabajosImpresion({ jobs, setJobs }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchJobs = () => {
    fetch("http://127.0.0.1:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const cancelJob = (id) => {
    fetch(`http://127.0.0.1:5000/api/cancel/${id}`, { method: "POST" })
      .then((res) => res.json())
      .then(() => fetchJobs())
      .catch((err) => console.error(err));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === "all" || job.status === filter;
    const matchesSearch =
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.printer?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por título o impresora"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md flex-1"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded-md">
          <option value="all">Todos</option>
          <option value="En cola">En cola</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border-b">ID</th>
              <th className="p-2 border-b">Título</th>
              <th className="p-2 border-b">Impresora</th>
              <th className="p-2 border-b">Usuario</th>
              <th className="p-2 border-b">Estado</th>
              <th className="p-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-2 text-gray-500">
                  No hay trabajos
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border-b">{job.id}</td>
                  <td className="p-2 border-b">{job.title}</td>
                  <td className="p-2 border-b">{job.printer}</td>
                  <td className="p-2 border-b">{job.submitted_by}</td>
                  <td className="p-2 border-b">{job.status}</td>
                  <td className="p-2 border-b">
                    {job.status === "En cola" && (
                      <button
                        onClick={() => cancelJob(job.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
