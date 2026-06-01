const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tokenController');
const verificarToken = require('../middlewares/authMiddleware');

// Todas las rutas de administración requieren token de usuario (autenticación)
router.get('/',                verificarToken, ctrl.getAll);
router.get('/:id',             verificarToken, ctrl.getById);
router.post('/',               verificarToken, ctrl.create);
router.put('/:id',             verificarToken, ctrl.update);
router.delete('/:id',          verificarToken, ctrl.remove);

// Ruta pública para que el ESP valide su token (no requiere token de usuario)
router.post('/validar',        ctrl.validarToken);

module.exports = router;