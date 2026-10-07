const { Router } = require('express');

const {
  obtenerProveedores,
  obtenerProvNombre,
  crearProveedor,
  modificarProveedor,
  bajaProveedor,
} = require("../controllers/proveedoresController.js")
const { validarBusqueda } = require('../middlewares/validar');
const {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarProveedor,
} = require('../middlewares/proveedoresMiddleware');

const router = Router();

// GET /api/proveedores?buscar=texto -> lista de proveedores, filtrada por nombre.
// Tambien alimenta el selector de proveedores del ABM de articulos.
router.get('/', validarBusqueda, obtenerProveedores);

// GET /api/proveedores/:nombre -> un proveedor
router.get('/:nombre', validarNombre, cargarProveedor, obtenerProvNombre);

// POST /api/proveedores -> alta
router.post('/', validarAlta, crearProveedor);

// PUT /api/proveedores/:nombre -> modificacion
router.put('/:nombre', validarNombre, validarModificacion, cargarProveedor, modificarProveedor);

// DELETE /api/proveedores/:nombre -> baja.
router.delete('/:nombre', validarNombre, cargarProveedor, bajaProveedor);

module.exports = router;
