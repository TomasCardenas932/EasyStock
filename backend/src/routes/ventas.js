const { Router } = require('express');

const { registrarVenta } = require('../controllers/ventasController');
const { validarVenta, prepararVenta } = require('../middlewares/ventasMiddleware');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { VENTAS } = require('../config/permisos');

const router = Router();

// POST /api/ventas -> registra una venta y descuenta el stock de lo vendido.
router.post('/', requierePermiso(VENTAS), validarVenta, prepararVenta, registrarVenta);

module.exports = router;
