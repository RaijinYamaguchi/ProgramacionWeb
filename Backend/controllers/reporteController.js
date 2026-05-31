const Reporte = require('../models/reporteModel');

// Devuelve todos los reportes con nombre de tanque y usuario
const getAll = (req, res) => {
  Reporte.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Devuelve un reporte por ID
const getById = (req, res) => {
  Reporte.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
    res.json(results[0]);
  });
};

// Crea un reporte; valida que fecha_fin sea posterior a fecha_inicio y que haya mediciones
const create = (req, res) => {
  const { titulo, tanque_id, fecha_inicio, fecha_fin,
          nivel_promedio, nivel_maximo, nivel_minimo, total_mediciones } = req.body;

  if (!titulo || !tanque_id || !fecha_inicio || !fecha_fin ||
      nivel_promedio === undefined || nivel_maximo === undefined ||
      nivel_minimo === undefined) {
    return res.status(400).json({ mensaje: 'Todos los campos del reporte son requeridos' });
  }
  if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
    return res.status(400).json({ mensaje: 'fecha_fin debe ser posterior a fecha_inicio' });
  }
  if (nivel_minimo > nivel_promedio || nivel_promedio > nivel_maximo) {
    return res.status(400).json({ mensaje: 'Los niveles deben cumplir: minimo ≤ promedio ≤ maximo' });
  }

  const data = {
    titulo, tanque_id, fecha_inicio, fecha_fin,
    nivel_promedio, nivel_maximo, nivel_minimo,
    total_mediciones: total_mediciones || 0,
    generado_por: req.usuario.id  // Tomado del token JWT
  };

  Reporte.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ mensaje: 'Reporte creado correctamente', id: result.insertId });
  });
};

// Actualiza el título del reporte; no permite modificar los estadísticos calculados
const update = (req, res) => {
  const { titulo } = req.body;

  if (!titulo) {
    return res.status(400).json({ mensaje: 'El campo titulo es requerido para actualizar' });
  }

  Reporte.update(req.params.id, { titulo }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
    res.json({ mensaje: 'Reporte actualizado correctamente' });
  });
};

// Elimina un reporte del historial
const remove = (req, res) => {
  Reporte.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
    res.json({ mensaje: 'Reporte eliminado correctamente' });
  });
};

// Endpoint extra: calcula los estadísticos de un tanque en un rango de fechas dado
const generarEstadisticos = (req, res) => {
  const { tanque_id, fecha_inicio, fecha_fin } = req.query;

  if (!tanque_id || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'tanque_id, fecha_inicio y fecha_fin son requeridos como query params' });
  }

  Reporte.generarEstadisticos(tanque_id, fecha_inicio, fecha_fin, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ tanque_id, fecha_inicio, fecha_fin, estadisticos: results[0] });
  });
};

module.exports = { getAll, getById, create, update, remove, generarEstadisticos };
