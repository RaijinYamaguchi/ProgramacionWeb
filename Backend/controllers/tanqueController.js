const Tanque = require('../models/tanqueModel');

// Devuelve la lista completa de tanques
const getAll = (req, res) => {
  Tanque.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Devuelve un tanque por ID; responde 404 si no existe
const getById = (req, res) => {
  Tanque.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Tanque no encontrado' });
    res.json(results[0]);
  });
};

// Crea un nuevo tanque; valida campos obligatorios y rangos de alerta
const create = (req, res) => {
  const { nombre, ubicacion, capacidad_max, nivel_min_alerta, nivel_max_alerta } = req.body;

  if (!nombre || !ubicacion || !capacidad_max) {
    return res.status(400).json({ mensaje: 'nombre, ubicacion y capacidad_max son requeridos' });
  }
  if (capacidad_max <= 0) {
    return res.status(400).json({ mensaje: 'La capacidad máxima debe ser mayor a 0' });
  }
  const min = nivel_min_alerta ?? 20;
  const max = nivel_max_alerta ?? 90;
  if (min >= max) {
    return res.status(400).json({ mensaje: 'nivel_min_alerta debe ser menor que nivel_max_alerta' });
  }

  const data = { nombre, ubicacion, capacidad_max, nivel_min_alerta: min, nivel_max_alerta: max };
  Tanque.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: 'Tanque registrado correctamente', id: result.insertId });
  });
};

// Actualiza un tanque; valida que los nuevos umbrales de alerta sean coherentes
const update = (req, res) => {
  const { nombre, ubicacion, capacidad_max, nivel_min_alerta, nivel_max_alerta, activo } = req.body;

  if (capacidad_max !== undefined && capacidad_max <= 0) {
    return res.status(400).json({ mensaje: 'La capacidad máxima debe ser mayor a 0' });
  }
  if (nivel_min_alerta !== undefined && nivel_max_alerta !== undefined) {
    if (nivel_min_alerta >= nivel_max_alerta) {
      return res.status(400).json({ mensaje: 'nivel_min_alerta debe ser menor que nivel_max_alerta' });
    }
  }

  const data = {};
  if (nombre)             data.nombre = nombre;
  if (ubicacion)          data.ubicacion = ubicacion;
  if (capacidad_max)      data.capacidad_max = capacidad_max;
  if (nivel_min_alerta !== undefined) data.nivel_min_alerta = nivel_min_alerta;
  if (nivel_max_alerta !== undefined) data.nivel_max_alerta = nivel_max_alerta;
  if (activo !== undefined)           data.activo = activo;

  Tanque.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Tanque no encontrado' });
    res.json({ mensaje: 'Tanque actualizado correctamente' });
  });
};

// Elimina un tanque; esto también elimina dispositivos y mediciones asociadas (CASCADE)
const remove = (req, res) => {
  Tanque.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Tanque no encontrado' });
    res.json({ mensaje: 'Tanque eliminado correctamente' });
  });
};

// Endpoint extra: muestra todos los tanques con su nivel actual según la última medición
const getNivelActual = (req, res) => {
  Tanque.getTanquesConNivelActual((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { getAll, getById, create, update, remove, getNivelActual };
