const { Router } = require('express');
const { validarBusqueda } = require('../middlewares/validar');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { ARTICULOS, VENTAS, MOVIMIENTOS } = require('../config/permisos');

const {
  obtenerProductos,
  obtenerProdCodigo,
  crearProducto,
  modificarProducto,
  bajaProducto,
} = require('../controllers/productosController');

const {
  validarCodigo,
  validarAlta,
  validarModificacion,
  cargarProducto,
  verificarCodigoLibre,
} = require('../middlewares/productosMiddleware');

const router = Router();

// GET /api/productos?buscar=texto -> lista de articulos, filtrada por codigo o nombre.
// Tambien la usan la pantalla de Ventas para elegir que vender y la entrada de
// stock de Movimientos para elegir el articulo.
router.get(
  '/',
  requierePermiso(ARTICULOS, VENTAS, MOVIMIENTOS),
  validarBusqueda,
  obtenerProductos
);

// GET /api/productos/:codigo -> un articulo
router.get('/:codigo', requierePermiso(ARTICULOS), validarCodigo, cargarProducto, obtenerProdCodigo);

// POST /api/productos -> alta
router.post('/', requierePermiso(ARTICULOS), validarAlta, verificarCodigoLibre, crearProducto);

// PUT /api/productos/:codigo -> modificacion
router.put(
  '/:codigo',
  requierePermiso(ARTICULOS),
  validarCodigo,
  validarModificacion,
  cargarProducto,
  verificarCodigoLibre,
  modificarProducto
);

// DELETE /api/productos/:codigo -> baja
router.delete('/:codigo', requierePermiso(ARTICULOS), validarCodigo, cargarProducto, bajaProducto);

module.exports = router;
