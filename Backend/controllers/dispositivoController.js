const Dispositivo = require('../models/dispositivoModel');

// Devuelve todos los dispositivos con información de tanque y usuario
const getAll = (req, res) => {
  Dispositivo.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Devuelve un dispositivo por ID
const getById = (req, res) => {
  Dispositivo.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    res.json(results[0]);
  });
};

// Registra un nuevo ESP; valida campos obligatorios y que funcionalidad sea válida
const create = (req, res) => {
  const { nombre, ubicacion, funcionalidad, usuario_id, tanque_id } = req.body;

  if (!nombre || !ubicacion || !usuario_id || !tanque_id) {
    return res.status(400).json({ mensaje: 'nombre, ubicacion, usuario_id y tanque_id son requeridos' });
  }
  const funcionesValidas = ['sensor', 'actuador'];
  if (funcionalidad && !funcionesValidas.includes(funcionalidad)) {
    return res.status(400).json({ mensaje: 'funcionalidad debe ser "sensor" o "actuador"' });
  }

  const data = { nombre, ubicacion, funcionalidad: funcionalidad || 'sensor', usuario_id, tanque_id };
  Dispositivo.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: 'Dispositivo registrado correctamente', id: result.insertId });
  });
};

// Actualiza datos del dispositivo; si se cambia funcionalidad, valida el valor
const update = (req, res) => {
  const { nombre, ubicacion, funcionalidad, tanque_id, activo } = req.body;

  if (funcionalidad && !['sensor', 'actuador'].includes(funcionalidad)) {
    return res.status(400).json({ mensaje: 'funcionalidad debe ser "sensor" o "actuador"' });
  }

  const data = {};
  if (nombre)      data.nombre = nombre;
  if (ubicacion)   data.ubicacion = ubicacion;
  if (funcionalidad) data.funcionalidad = funcionalidad;
  if (tanque_id)   data.tanque_id = tanque_id;
  if (activo !== undefined) data.activo = activo;

  Dispositivo.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    res.json({ mensaje: 'Dispositivo actualizado correctamente' });
  });
};

// Elimina un dispositivo del sistema
const remove = (req, res) => {
  Dispositivo.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    res.json({ mensaje: 'Dispositivo eliminado correctamente' });
  });
};

// Endpoint extra: lista dispositivos de un tanque específico
const getByTanque = (req, res) => {
  Dispositivo.getByTanque(req.params.tanque_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { getAll, getById, create, update, remove, getByTanque };
