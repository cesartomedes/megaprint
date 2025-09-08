const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = "./data/impresiones.json";

// GET: obtener todas las impresiones
app.get("/impresiones", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  res.json(data);
});

// POST: incrementar impresiones de un volante
app.post("/impresiones/:volanteId", (req, res) => {
  const volanteId = parseInt(req.params.volanteId);
  const { cantidad = 1 } = req.body;

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const item = data.find((v) => v.volanteId === volanteId);
  if (!item) return res.status(404).json({ error: "Volante no encontrado" });

  item.cantidadImpresaHoy += cantidad;
  item.cantidadImpresaSemana += cantidad;

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json(item);
});

// Reiniciar diariamente (mockup: podrías llamarlo manualmente)
app.post("/impresiones/resetDia", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  data.forEach((v) => (v.cantidadImpresaHoy = 0));
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ message: "Límite diario reiniciado" });
});

app.listen(8001, () => console.log("Backend mockup corriendo en http://localhost:8001"));
