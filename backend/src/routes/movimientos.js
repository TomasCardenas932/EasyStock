const { Router } = require('express');

const { obtenerMovimientos, registrarEntrada } = require('../controllers/movimientosController');
const {
  validarBusqueda,
  validarEntrada,
  cargarProductoEntrada,
} = require('../middlewares/movimientosMiddleware');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { MOVIMIENTOS } = require('../config/permisos');

const router = Router();

// GET /api/movimientos?buscar=texto -> registro de operaciones, del mas nuevo
// al mas viejo, filtrado por fecha o por numero de identificador
router.get('/', requierePermiso(MOVIMIENTOS), validarBusqueda, obtenerMovimientos);

// POST /api/movimientos/entradas -> suma unidades al stock de un articulo y
// registra la entrada
router.post(
  '/entradas',
  requierePermiso(MOVIMIENTOS),
  validarEntrada,
  cargarProductoEntrada,
  registrarEntrada
);

module.exports = router;
