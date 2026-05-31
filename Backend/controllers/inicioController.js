const Inicio = require('../models/inicioModel');

// Ruta de bienvenida post-login con dato dinámico de la base de datos
const getInicio = (req, res) => {
  Inicio.getTotalMediciones((err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      sistema: 'Sistema de Control de Agua — HC-SR04 + ESP',
      bienvenida: `Bienvenido, ${req.usuario.nombre}`,
      fecha_servidor: new Date().toISOString(),
      modulos: [
        'Tanques',
        'Dispositivos',
        'Mediciones',
        'Reportes',
        'Usuarios'
      ],
      estadisticas: {
        total_mediciones_registradas: results[0].total
      }
    });
  });
};

module.exports = { getInicio };
