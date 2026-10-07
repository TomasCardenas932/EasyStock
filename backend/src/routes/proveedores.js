const { Router } = require('express');

const {
  obtenerProveedores,
  obtenerProvNombre,
  crearProveedor,
  modificarProveedor,
  bajaProveedor,
} = require("../controllers/proveedoresController.js")

const router = Router();

// GET /api/proveedores?buscar=texto -> lista de proveedores, filtrada por nombre.
// Tambien alimenta el selector de proveedores del ABM de articulos.
router.get('/', obtenerProveedores);

// GET /api/proveedores/:nombre -> un proveedor
router.get('/:nombre', obtenerProvNombre);

// POST /api/proveedores -> alta
router.post('/', crearProveedor);

// PUT /api/proveedores/:nombre -> modificacion
router.put('/:nombre', modificarProveedor);

// DELETE /api/proveedores/:nombre -> baja.
router.delete('/:nombre', bajaProveedor);

module.exports = router;
