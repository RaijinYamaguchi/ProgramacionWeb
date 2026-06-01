const db = require('../config/database');

class TokenModel {
  // Crear un nuevo token para dispositivo
  static crearToken(data, callback) {
    const query = 'INSERT INTO tokens_dispositivos SET ?';
    db.query(query, data, callback);
  }

  // Obtener token por dispositivo_id
  static obtenerPorDispositivo(dispositivo_id, callback) {
    const query = 'SELECT * FROM tokens_dispositivos WHERE dispositivo_id = ? AND activo = 1 ORDER BY creado_en DESC LIMIT 1';
    db.query(query, [dispositivo_id], callback);
  }

  // Obtener todos los tokens de un dispositivo
  static obtenerTodosDispositivo(dispositivo_id, callback) {
    const query = 'SELECT * FROM tokens_dispositivos WHERE dispositivo_id = ? ORDER BY creado_en DESC';
    db.query(query, [dispositivo_id], callback);
  }

  // Verificar si un token existe y está activo
  static verificarToken(token, callback) {
    const query = 'SELECT * FROM tokens_dispositivos WHERE token = ? AND activo = 1 AND expires_at > NOW()';
    db.query(query, [token], callback);
  }

  // Desactivar token
  static desactivarToken(id, callback) {
    const query = 'UPDATE tokens_dispositivos SET activo = 0 WHERE id = ?';
    db.query(query, [id], callback);
  }

  // Actualizar último uso
  static actualizarUltimo(id, callback) {
    const query = 'UPDATE tokens_dispositivos SET ultimo_uso = NOW() WHERE id = ?';
    db.query(query, [id], callback);
  }

  // Listar tokens activos de usuario (a través de dispositivos)
  static listarTokensUsuario(usuario_id, callback) {
    const query = `
      SELECT 
        td.id,
        td.dispositivo_id,
        td.descripcion,
        td.activo,
        td.expires_at,
        td.creado_en,
        td.ultimo_uso,
        d.nombre as dispositivo_nombre,
        t.nombre as tanque_nombre
      FROM tokens_dispositivos td
      JOIN dispositivos d ON td.dispositivo_id = d.id
      JOIN tanques t ON d.tanque_id = t.id
      WHERE d.usuario_id = ?
      ORDER BY td.creado_en DESC
    `;
    db.query(query, [usuario_id], callback);
  }

  // Eliminar token (baja lógica)
  static eliminarToken(id, callback) {
    const query = 'UPDATE tokens_dispositivos SET activo = 0 WHERE id = ?';
    db.query(query, [id], callback);
  }
}

module.exports = TokenModel;
