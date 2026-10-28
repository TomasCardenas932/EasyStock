const { Router } = require('express');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { USUARIOS } = require('../config/permisos');

const {
  obtenerRoles,
  obtenerRolNombre,
  crearRol,
  modificarRol,
  asignarPermisos,
  bajaRol,
} = require('../controllers/rolesController');

const {
  validarNombre,
  validarAlta,
  validarModificacion,
  validarPermisos,
  cargarRol,
  cargarPermisos,
  verificarSinUsuarios,
} = require('../middlewares/rolesMiddleware');

const router = Router();

// Los roles se administran desde la pantalla de usuarios.
router.use(requierePermiso(USUARIOS));

// GET /api/roles -> lista de roles, cada uno con sus permisos
router.get('/', obtenerRoles);

// GET /api/roles/:nombre -> un rol con sus permisos
router.get('/:nombre', validarNombre, cargarRol, obtenerRolNombre);

// POST /api/roles -> alta, con permisoIds opcional
router.post('/', validarAlta, cargarPermisos, crearRol);

// PUT /api/roles/:nombre -> modificacion del nombre
router.put('/:nombre', validarNombre, validarModificacion, cargarRol, modificarRol);

// PUT /api/roles/:nombre/permisos -> reemplaza los permisos del rol
router.put(
  '/:nombre/permisos',
  validarNombre,
  validarPermisos,
  cargarRol,
  cargarPermisos,
  asignarPermisos
);

// DELETE /api/roles/:nombre -> baja, solo si no tiene usuarios asignados
router.delete('/:nombre', validarNombre, cargarRol, verificarSinUsuarios, bajaRol);

module.exports = router;
