const db = require('../config/database');

const Tanque = {
  // Obtiene todos los tanques activos registrados en el sistema
  getAll: (callback) => {
    db.query('SELECT * FROM tanques ORDER BY nombre ASC', callback);
  },

  // Obtiene un tanque específico por su ID
  getById: (id, callback) => {
    db.query('SELECT * FROM tanques WHERE id = ?', [id], callback);
  },

  // Inserta un nuevo tanque con su configuración de alertas
  create: (data, callback) => {
    db.query('INSERT INTO tanques SET ?', [data], callback);
  },

  // Actualiza los datos de un tanque existente
  update: (id, data, callback) => {
    db.query('UPDATE tanques SET ? WHERE id = ?', [data, id], callback);
  },

  // Elimina un tanque por ID (también borra dispositivos asociados por CASCADE)
  delete: (id, callback) => {
    db.query('DELETE FROM tanques WHERE id = ?', [id], callback);
  },

  // Endpoint extra: obtiene tanques con el nivel actual de su última medición
  getTanquesConNivelActual: (callback) => {
    const sql = `
      SELECT t.id, t.nombre, t.ubicacion, t.capacidad_max,
             t.nivel_min_alerta, t.nivel_max_alerta,
             m.nivel_agua, m.porcentaje, m.fecha AS ultima_medicion
      FROM tanques t
      LEFT JOIN dispositivos d ON d.tanque_id = t.id AND d.funcionalidad = 'sensor'
      LEFT JOIN mediciones m ON m.id = (
        SELECT id FROM mediciones
        WHERE dispositivo_id = d.id
        ORDER BY fecha DESC LIMIT 1
      )
      WHERE t.activo = 1
      ORDER BY t.nombre ASC
    `;
    db.query(sql, callback);
  }
};

module.exports = Tanque;
