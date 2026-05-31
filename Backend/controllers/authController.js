const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Auth   = require('../models/authModel');
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
module.exports = { registro, login, listarUsuarios, obtenerUsuario, editarUsuario, eliminarUsuario };
