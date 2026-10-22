const { Router } = require('express');

const {
  obtenerPermisos,
  obtenerPermisoNombre,
  crearPermiso,
  modificarPermiso,
  bajaPermiso,
} = require('../controllers/permisosController');

const {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarPermiso,
} = require('../middlewares/permisosMiddleware');

const router = Router();

// GET /api/permisos -> lista de permisos
router.get('/', obtenerPermisos);

// GET /api/permisos/:nombre -> un permiso
router.get('/:nombre', validarNombre, cargarPermiso, obtenerPermisoNombre);

// POST /api/permisos -> alta
router.post('/', validarAlta, crearPermiso);

// PUT /api/permisos/:nombre -> modificacion
router.put('/:nombre', validarNombre, validarModificacion, cargarPermiso, modificarPermiso);

// DELETE /api/permisos/:nombre -> baja
router.delete('/:nombre', validarNombre, cargarPermiso, bajaPermiso);

module.exports = router;
