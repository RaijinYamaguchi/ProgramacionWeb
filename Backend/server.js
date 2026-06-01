const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
// Middleware de logging a archivo
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.path}\n`;
  fs.appendFileSync('/tmp/server.log', log);
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas de autenticación (no requieren token)
app.use('/api/auth',require('./routes/auth'));

// Ruta de inicio post-login (requiere token)
app.use('/api/inicio',require('./routes/inicio'));

// Rutas de los 5 módulos CRUD
app.use('/api/tanques',require('./routes/tanques'));
app.use('/api/dispositivos',require('./routes/dispositivos'));
app.use('/api/mediciones',require('./routes/mediciones'));
app.use('/api/reportes',require('./routes/reportes'));
app.use('/api/tokens', require('./routes/tokens'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});