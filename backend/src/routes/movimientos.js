const { Router } = require('express');

const { obtenerMovimientos } = require('../controllers/movimientosController');
const { validarBusqueda } = require('../middlewares/movimientosMiddleware');

const router = Router();

// GET /api/movimientos?buscar=texto -> registro de operaciones, del mas nuevo
// al mas viejo, filtrado por fecha o por numero de identificador
router.get('/', validarBusqueda, obtenerMovimientos);

module.exports = router;
