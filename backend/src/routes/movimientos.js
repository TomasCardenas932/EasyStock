const { Router } = require('express');

const { obtenerMovimientos } = require('../controllers/movimientosController');

const router = Router();

// GET /api/movimientos -> registro de operaciones, del mas nuevo al mas viejo
router.get('/', obtenerMovimientos);

module.exports = router;
