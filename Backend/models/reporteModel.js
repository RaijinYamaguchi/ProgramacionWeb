const db = require('../config/database');

const Reporte = {
  // Obtiene todos los reportes con el nombre del tanque y del usuario que lo generó
  getAll: (callback) => {
    const sql = `
      SELECT r.*, t.nombre AS tanque_nombre, u.nombre AS generado_por_nombre
      FROM reportes r
      JOIN tanques   t ON t.id = r.tanque_id
      JOIN usuarios  u ON u.id = r.generado_por
      ORDER BY r.creado_en DESC
    `;
    db.query(sql, callback);
  },

  // Obtiene un reporte específico por ID
  getById: (id, callback) => {
    db.query('SELECT * FROM reportes WHERE id = ?', [id], callback);
  },

  // Inserta un nuevo reporte de análisis de nivel de agua
  create: (data, callback) => {
    db.query('INSERT INTO reportes SET ?', [data], callback);
  },

  // Actualiza el título u otros metadatos de un reporte existente
  update: (id, data, callback) => {
    db.query('UPDATE reportes SET ? WHERE id = ?', [data, id], callback);
  },

  // Elimina un reporte
  delete: (id, callback) => {
    db.query('DELETE FROM reportes WHERE id = ?', [id], callback);
  },

  // Endpoint extra: genera automáticamente los estadísticos de un tanque en un rango de fechas
  generarEstadisticos: (tanque_id, fecha_inicio, fecha_fin, callback) => {
    const sql = `
      SELECT
        COUNT(*)       AS total_mediciones,
        AVG(m.nivel_agua) AS nivel_promedio,
        MAX(m.nivel_agua) AS nivel_maximo,
        MIN(m.nivel_agua) AS nivel_minimo
      FROM mediciones m
      JOIN dispositivos d ON d.id = m.dispositivo_id
      WHERE d.tanque_id = ?
        AND m.fecha BETWEEN ? AND ?
    `;
    db.query(sql, [tanque_id, fecha_inicio, fecha_fin], callback);
  }
};

module.exports = Reporte;
