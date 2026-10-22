const { Router } = require('express');

const {
  obtenerProveedores,
  obtenerProvNombre,
  crearProveedor,
  modificarProveedor,
  bajaProveedor,
} = require("../controllers/proveedoresController.js")
const { validarBusqueda } = require('../middlewares/validar');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { ARTICULOS } = require('../config/permisos');
const {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarProveedor,
} = require('../middlewares/proveedoresMiddleware');

const router = Router();

// GET /api/proveedores?buscar=texto -> lista de proveedores, filtrada por nombre.
// Tambien alimenta el selector de proveedores del ABM de articulos.
router.get('/', requierePermiso(ARTICULOS), validarBusqueda, obtenerProveedores);

// GET /api/proveedores/:nombre -> un proveedor
router.get('/:nombre', requierePermiso(ARTICULOS), validarNombre, cargarProveedor, obtenerProvNombre);

// POST /api/proveedores -> alta
router.post('/', requierePermiso(ARTICULOS), validarAlta, crearProveedor);

// PUT /api/proveedores/:nombre -> modificacion
router.put(
  '/:nombre',
  requierePermiso(ARTICULOS),
  validarNombre,
  validarModificacion,
  cargarProveedor,
  modificarProveedor
);

// DELETE /api/proveedores/:nombre -> baja.
router.delete('/:nombre', requierePermiso(ARTICULOS), validarNombre, cargarProveedor, bajaProveedor);

module.exports = router;
