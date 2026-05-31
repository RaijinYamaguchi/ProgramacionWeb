const db = require('../config/database'); 


const Auth = {
  // Busca un usuario por email para verificar credenciales en login
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], callback);
  },

  // Inserta un nuevo usuario con contraseña ya encriptada
  createUser: (data, callback) => {
    db.query('INSERT INTO usuarios SET ?', [data], callback);
  },

  // Obtener todos los usuarios
  getAll: (callback) => {
    db.query('SELECT * FROM usuarios', callback);
  },

  // Obtener usuario por ID
  getById: (id, callback) => {
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], callback);
  },

  // Actualizar usuario
  update: (id, data, callback) => {
    db.query('UPDATE usuarios SET ? WHERE id = ?', [data, id], callback);
  },

  // Eliminar usuario
  delete: (id, callback) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [id], callback);
  }
};

module.exports = Auth;
