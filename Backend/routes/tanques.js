const express        = require('express');
const router         = express.Router();
const ctrl           = require('../controllers/tanqueController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/',                   ctrl.getAll);
router.get('/nivel-actual',       ctrl.getNivelActual);      // Endpoint extra: nivel actual por tanque
router.get('/:id',                ctrl.getById);
router.post('/',                  verificarToken, ctrl.create);
router.put('/:id',                verificarToken, ctrl.update);
router.delete('/:id',             verificarToken, ctrl.remove);

module.exports = router;
