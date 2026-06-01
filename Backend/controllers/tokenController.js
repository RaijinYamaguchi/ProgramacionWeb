const Token = require('../models/tokenModel');
const crypto = require('crypto');

// Obtener todos los tokens (con nombre del dispositivo)
const getAll = (req, res) => {
  Token.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener un token por ID
const getById = (req, res) => {
  Token.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Token no encontrado' });
    res.json(results[0]);
  });
};

// Crear un nuevo token (genera el token automáticamente)
const create = (req, res) => {
  const { dispositivo_id, descripcion, expires_in_days } = req.body;
  if (!dispositivo_id) {
    return res.status(400).json({ mensaje: 'dispositivo_id es requerido' });
  }

  // Generar token aleatorio de 64 caracteres hexadecimales (32 bytes)
  const token = crypto.randomBytes(32).toString('hex');
  let expires_at = null;
  if (expires_in_days && !isNaN(parseInt(expires_in_days))) {
    const dias = parseInt(expires_in_days);
    expires_at = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  }

  const data = {
    token,
    dispositivo_id,
    descripcion: descripcion || null,
    activo: 1,
    expires_at,
    creado_en: new Date()
  };

  Token.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      mensaje: 'Token generado exitosamente',
      id: result.insertId,
      token: token   // se envía solo una vez
    });
  });
};

// Actualizar token (solo se permite cambiar activo, descripcion o expires_at)
const update = (req, res) => {
  const { activo, descripcion, expires_at } = req.body;
  const data = {};
  if (activo !== undefined) data.activo = activo;
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (expires_at !== undefined) data.expires_at = expires_at;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos válidos para actualizar' });
  }

  Token.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Token no encontrado' });
    res.json({ mensaje: 'Token actualizado correctamente' });
  });
};

// Eliminar token (borrado físico)
const remove = (req, res) => {
  Token.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Token no encontrado' });
    res.json({ mensaje: 'Token eliminado' });
  });
};

// Validar token (usado por ESP8266/ESP32 antes o durante el envío de mediciones)
const validarToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token no proporcionado' });

  Token.validar(token, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Token inválido o expirado' });

    const tokenData = results[0];
    // Registrar el último uso (opcional, para auditoría)
    Token.registrarUso(tokenData.id, (err2) => {
      if (err2) console.error('Error al actualizar último uso:', err2);
    });
    res.json({
      valido: true,
      dispositivo_id: tokenData.dispositivo_id,
      mensaje: 'Token válido'
    });
  });
};

module.exports = { getAll, getById, create, update, remove, validarToken };