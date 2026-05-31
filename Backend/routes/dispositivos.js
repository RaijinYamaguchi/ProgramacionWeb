const express        = require('express');
const router         = express.Router();
const ctrl           = require('../controllers/dispositivoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/',                          ctrl.getAll);
router.get('/tanque/:tanque_id',         ctrl.getByTanque);   // Endpoint extra: dispositivos por tanque
router.get('/:id',                       ctrl.getById);
router.post('/',                         verificarToken, ctrl.create);
router.put('/:id',                       verificarToken, ctrl.update);
router.delete('/:id',                    verificarToken, ctrl.remove);

module.exports = router;
