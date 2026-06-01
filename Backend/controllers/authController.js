const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Auth   = require('../models/authModel');
const TokenModel = require('../models/tokenModel');
const Dispositivo = require('../models/dispositivoModel');
require('dotenv').config();

// Registro: valida campos, evita emails duplicados, encripta password y crea usuario
const registro = (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ mensaje: 'Nombre, email y password son requeridos' });
  }

  Auth.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(400).json({ mensaje: 'Este email ya está registrado' });
    }

    const passwordEncriptada = bcrypt.hashSync(password, 10);
    Auth.createUser({ nombre, email, password: passwordEncriptada }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ mensaje: 'Usuario registrado correctamente', id: result.insertId });
    });
  });
};

// Login: verifica credenciales y devuelve un token JWT firmado
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y password son requeridos' });
  }

  Auth.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = results[0];
    const passwordCorrecta = bcrypt.compareSync(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ mensaje: 'Login exitoso', token, nombre: usuario.nombre, rol: usuario.rol });
  });
};
const listarUsuarios = (req, res) => {
  Auth.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
const obtenerUsuario = (req, res) => {
  const id = req.params.id;
  Auth.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
};
const editarUsuario = (req, res) => {
  const id = req.params.id;
  const { nombre, email, password, rol } = req.body;

  Auth.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioExistente = results[0];
    const passwordEncriptada = password ? bcrypt.hashSync(password, 10) : usuarioExistente.password;

    Auth.update(id, { nombre, email, password: passwordEncriptada, rol }, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Usuario actualizado correctamente' }); 
    });
  });
};
const eliminarUsuario = (req, res) => {
  const id = req.params.id;

  Auth.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    Auth.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Usuario eliminado correctamente' });
    });
  });
};

// Generar JWT secundario para dispositivos ESP (válido 1 año)
const generarTokenDispositivo = (req, res) => {
  const { dispositivo_id, descripcion } = req.body;
  const usuario_id = req.userId; // Del middleware de autenticación

  if (!dispositivo_id) {
    return res.status(400).json({ error: 'dispositivo_id es requerido' });
  }

  // Verificar que el dispositivo pertenece al usuario
  Dispositivo.getById(dispositivo_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    const dispositivo = results[0];
    if (dispositivo.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No tienes permiso sobre este dispositivo' });
    }

    // Generar token con duración de 1 año
    const tokenJWT = jwt.sign(
      {
        dispositivo_id: dispositivo.id,
        usuario_id: usuario_id,
        nombre: dispositivo.nombre,
        tipo: 'esp32_sensor'
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' } // 1 año
    );

    // Calcular fecha de expiración (1 año desde ahora)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Guardar token en la base de datos
    const tokenData = {
      dispositivo_id: dispositivo.id,
      token: tokenJWT,
      descripcion: descripcion || `Token ESP - ${dispositivo.nombre}`,
      activo: 1,
      expires_at: expiresAt
    };

    TokenModel.crearToken(tokenData, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.status(201).json({
        mensaje: 'Token generado correctamente',
        token: tokenJWT,
        dispositivo_id: dispositivo.id,
        dispositivo_nombre: dispositivo.nombre,
        expires_at: expiresAt,
        duracion: '1 año'
      });
    });
  });
};

// Obtener tokens de dispositivos del usuario
const obtenerTokensDispositivos = (req, res) => {
  const usuario_id = req.userId;

  TokenModel.listarTokensUsuario(usuario_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
};

// Desactivar un token de dispositivo
const desactivarTokenDispositivo = (req, res) => {
  const { token_id } = req.params;
  const usuario_id = req.userId;

  // Primero verificar que el token pertenece al usuario
  // Para esto necesitamos hacer una query más compleja
  const db = require('../config/database');
  const query = `
    SELECT td.* FROM tokens_dispositivos td
    JOIN dispositivos d ON td.dispositivo_id = d.id
    WHERE td.id = ? AND d.usuario_id = ?
  `;

  db.query(query, [token_id, usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Token no encontrado o sin permisos' });
    }

    TokenModel.desactivarToken(token_id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Token desactivado correctamente' });
    });
  });
};

// Verificar token de dispositivo (para uso del ESP)
const verificarTokenEsp = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  TokenModel.verificarToken(token, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const tokenData = results[0];
    // Actualizar último uso
    TokenModel.actualizarUltimo(tokenData.id, () => {});

    res.json({
      valido: true,
      dispositivo_id: tokenData.dispositivo_id,
      dispositivo_nombre: tokenData.descripcion,
      expires_at: tokenData.expires_at
    });
  });
};  
module.exports = { 
  registro, 
  login, 
  listarUsuarios, 
  obtenerUsuario, 
  editarUsuario, 
  eliminarUsuario,
  generarTokenDispositivo,
  obtenerTokensDispositivos,
  desactivarTokenDispositivo,
  verificarTokenEsp
};
