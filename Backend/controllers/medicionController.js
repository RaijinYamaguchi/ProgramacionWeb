const Medicion = require('../models/medicionModel');

// Devuelve todas las mediciones con nombre del dispositivo
const getAll = (req, res) => {
  Medicion.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Devuelve una medición por ID
const getById = (req, res) => {
  Medicion.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Medición no encontrada' });
    res.json(results[0]);
  });
};

// Registra una lectura del HC-SR04; valida que nivel y porcentaje sean valores físicamente posibles
const create = (req, res) => {
  const { dispositivo_id, nivel_agua, porcentaje } = req.body;

  if (!dispositivo_id || nivel_agua === undefined || porcentaje === undefined) {
    return res.status(400).json({ mensaje: 'dispositivo_id, nivel_agua y porcentaje son requeridos' });
  }
  if (nivel_agua < 0) {
    return res.status(400).json({ mensaje: 'nivel_agua no puede ser negativo' });
  }
  if (porcentaje < 0 || porcentaje > 100) {
    return res.status(400).json({ mensaje: 'porcentaje debe estar entre 0 y 100' });
  }

  const data = { dispositivo_id, nivel_agua, porcentaje };
  Medicion.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: 'Medición registrada correctamente', id: result.insertId });
  });
};

// Actualiza una medición; aplica las mismas validaciones de rango que en create
const update = (req, res) => {
  const { nivel_agua, porcentaje } = req.body;

  if (nivel_agua !== undefined && nivel_agua < 0) {
    return res.status(400).json({ mensaje: 'nivel_agua no puede ser negativo' });
  }
  if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
    return res.status(400).json({ mensaje: 'porcentaje debe estar entre 0 y 100' });
  }

  const data = {};
  if (nivel_agua !== undefined) data.nivel_agua = nivel_agua;
  if (porcentaje !== undefined) data.porcentaje = porcentaje;

  Medicion.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Medición no encontrada' });
    res.json({ mensaje: 'Medición actualizada correctamente' });
  });
};

// Elimina una medición
const remove = (req, res) => {
  Medicion.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Medición no encontrada' });
    res.json({ mensaje: 'Medición eliminada correctamente' });
  });
};

// Endpoint extra: últimas lecturas de un dispositivo (por defecto 10, configurable con ?limite=N)
const getUltimasPorDispositivo = (req, res) => {
  const limite = req.query.limite || 10;
  Medicion.getUltimasPorDispositivo(req.params.dispositivo_id, limite, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { getAll, getById, create, update, remove, getUltimasPorDispositivo };
