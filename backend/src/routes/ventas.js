const { Router } = require('express');

const { registrarVenta } = require('../controllers/ventasController');
const { validarVenta, prepararVenta } = require('../middlewares/ventasMiddleware');

const router = Router();

// POST /api/ventas -> registra una venta y descuenta el stock de lo vendido.
router.post('/', validarVenta, prepararVenta, registrarVenta);

module.exports = router;
