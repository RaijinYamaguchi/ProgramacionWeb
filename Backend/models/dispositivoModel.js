const db = require('../config/database');

const Dispositivo = {
  // Obtiene todos los dispositivos con el nombre del tanque y del usuario asociado
  getAll: (callback) => {
    const sql = `
      SELECT d.*, t.nombre AS tanque_nombre, u.nombre AS usuario_nombre
      FROM dispositivos d
      JOIN tanques  t ON t.id = d.tanque_id
      JOIN usuarios u ON u.id = d.usuario_id
      ORDER BY d.nombre ASC
    `;
    db.query(sql, callback);
  },

  // Obtiene un dispositivo específico por ID
  getById: (id, callback) => {
    db.query('SELECT * FROM dispositivos WHERE id = ?', [id], callback);
  },

  // Registra un nuevo ESP en el sistema y lo asocia a un tanque y usuario
  create: (data, callback) => {
    db.query('INSERT INTO dispositivos SET ?', [data], callback);
  },

  // Actualiza los datos de un dispositivo registrado
  update: (id, data, callback) => {
    db.query('UPDATE dispositivos SET ? WHERE id = ?', [data, id], callback);
  },

  // Elimina un dispositivo; sus mediciones se borran por CASCADE
  delete: (id, callback) => {
    db.query('DELETE FROM dispositivos WHERE id = ?', [id], callback);
  },

  // Endpoint extra: obtiene dispositivos filtrados por tanque_id
  getByTanque: (tanque_id, callback) => {
    db.query(
      'SELECT * FROM dispositivos WHERE tanque_id = ? ORDER BY nombre ASC',
      [tanque_id],
      callback
    );
  }
};

module.exports = Dispositivo;
