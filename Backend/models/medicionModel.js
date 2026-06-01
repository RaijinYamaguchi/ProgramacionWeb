const db = require('../config/database');

const Medicion = {
  // Obtiene todas las mediciones con nombre del dispositivo, ordenadas por fecha descendente
  getAll: (callback) => {
    const sql = `
      SELECT m.*, 
             d.nombre AS dispositivo_nombre, 
             d.tanque_id,
             t.nombre AS tanque_nombre
      FROM mediciones m
      JOIN dispositivos d ON d.id = m.dispositivo_id
      LEFT JOIN tanques t ON d.tanque_id = t.id
      ORDER BY m.fecha DESC
    `;
    db.query(sql, callback);
  },

  // Obtiene una medición específica por ID
  getById: (id, callback) => {
    db.query('SELECT * FROM mediciones WHERE id = ?', [id], callback);
  },

  // Inserta una nueva lectura enviada por el HC-SR04
  create: (data, callback) => {
    db.query('INSERT INTO mediciones SET ?', [data], callback);
  },

  // Corrige una medición registrada (por error de lectura del sensor, por ejemplo)
  update: (id, data, callback) => {
    db.query('UPDATE mediciones SET ? WHERE id = ?', [data, id], callback);
  },

  // Elimina una medición incorrecta o duplicada
  delete: (id, callback) => {
    db.query('DELETE FROM mediciones WHERE id = ?', [id], callback);
  },

  // Endpoint extra: obtiene las últimas N mediciones de un dispositivo específico
  getUltimasPorDispositivo: (dispositivo_id, limite, callback) => {
    db.query(
      'SELECT * FROM mediciones WHERE dispositivo_id = ? ORDER BY fecha DESC LIMIT ?',
      [dispositivo_id, parseInt(limite)],
      callback
    );
  }
};

module.exports = Medicion;
