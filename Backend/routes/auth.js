const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/registro', ctrl.registro);
router.post('/login',    ctrl.login);
router.get('/usuarios', verificarToken, ctrl.listarUsuarios);
router.get('/usuarios/:id', verificarToken, ctrl.obtenerUsuario);
router.put('/usuarios/:id', verificarToken, ctrl.editarUsuario);
router.delete('/usuarios/:id', verificarToken, ctrl.eliminarUsuario);

module.exports = router;
