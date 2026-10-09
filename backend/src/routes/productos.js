const { Router } = require('express');
const { validarBusqueda } = require('../middlewares/validar');

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
} = require('../middlewares/productosMiddleware');

const router = Router();

// GET /api/productos?buscar=texto -> lista de articulos, filtrada por codigo o nombre
router.get('/', validarBusqueda, obtenerProductos);

// GET /api/productos/:codigo -> un articulo
router.get('/:codigo', validarCodigo, cargarProducto, obtenerProdCodigo);

// POST /api/productos -> alta
router.post('/', validarAlta, crearProducto);

// PUT /api/productos/:codigo -> modificacion
router.put('/:codigo', validarCodigo, validarModificacion, cargarProducto, modificarProducto);

// DELETE /api/productos/:codigo -> baja
router.delete('/:codigo', validarCodigo, cargarProducto, bajaProducto);

module.exports = router;
