const db = require('../config/database');

const Token = {
  // Obtiene todos los tokens con el nombre del dispositivo asociado
  getAll: (callback) => {
    const sql = `
      SELECT t.*, d.nombre AS dispositivo_nombre
      FROM tokens_dispositivos t
      JOIN dispositivos d ON d.id = t.dispositivo_id
      ORDER BY t.creado_en DESC
    `;
    db.query(sql, callback);
  },

  // Obtiene un token por su ID interno
  getById: (id, callback) => {
    const sql = 'SELECT * FROM tokens_dispositivos WHERE id = ?';
    db.query(sql, [id], callback);
  },

  // Inserta un nuevo token
  create: (data, callback) => {
    const sql = 'INSERT INTO tokens_dispositivos SET ?';
    db.query(sql, [data], callback);
  },

  // Actualiza campos de un token
  update: (id, data, callback) => {
    const sql = 'UPDATE tokens_dispositivos SET ? WHERE id = ?';
    db.query(sql, [data, id], callback);
  },

  // Elimina un token
  delete: (id, callback) => {
    const sql = 'DELETE FROM tokens_dispositivos WHERE id = ?';
    db.query(sql, [id], callback);
  },

  // Valida si un token es activo y no ha expirado
  validar: (token, callback) => {
    const sql = `
      SELECT * FROM tokens_dispositivos
      WHERE token = ? AND activo = 1
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
    db.query(sql, [token], callback);
  },

  // Registra la fecha/hora del último uso del token
  registrarUso: (id, callback) => {
    const sql = 'UPDATE tokens_dispositivos SET ultimo_uso = NOW() WHERE id = ?';
    db.query(sql, [id], callback);
  }
};

module.exports = Token;