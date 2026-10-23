const { Router } = require('express');

const { obtenerResumen } = require('../controllers/dashboardController');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { DASHBOARD } = require('../config/permisos');

const router = Router();

// GET /api/dashboard -> cantidad de articulos cargados, sin stock, para
// reponer y sin precio al publico, los articulos mas urgentes de reponer y
// los primeros articulos sin precio
router.get('/', requierePermiso(DASHBOARD), obtenerResumen);

module.exports = router;
