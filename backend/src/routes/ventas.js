'use strict';

const { Router } = require('express');

const { registrarVenta } = require('../controllers/ventasController');

const router = Router();

// POST /api/ventas -> registra una venta y descuenta el stock de lo vendido.
router.post('/', registrarVenta);

module.exports = router;
