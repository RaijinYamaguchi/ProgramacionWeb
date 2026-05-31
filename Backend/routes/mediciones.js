const express        = require('express');
const router         = express.Router();
const ctrl           = require('../controllers/medicionController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/',                                     ctrl.getAll);
router.get('/dispositivo/:dispositivo_id/ultimas',  ctrl.getUltimasPorDispositivo);  // Endpoint extra
router.get('/:id',                                  ctrl.getById);
router.post('/',                                    verificarToken, ctrl.create);
router.put('/:id',                                  verificarToken, ctrl.update);
router.delete('/:id',                               verificarToken, ctrl.remove);

module.exports = router;
