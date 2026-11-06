const { Router } = require('express');
const { validarBusqueda } = require('../middlewares/validar');
const { requierePermiso } = require('../middlewares/sesionMiddleware');
const { USUARIOS } = require('../config/permisos');

const {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  modificarUsuario,
  bajaUsuario,
} = require('../controllers/usuariosController');

const {
  validarId,
  validarAlta,
  validarModificacion,
  cargarUsuario,
  verificarRol,
  verificarRolPropio,
  verificarNoEsPropio,
} = require('../middlewares/usuariosMiddleware');

const router = Router();

// Todas las rutas son de la pantalla de administracion de usuarios.
router.use(requierePermiso(USUARIOS));

// GET /api/usuarios?buscar=texto -> lista de usuarios, filtrada por nombre o apellido
router.get('/', validarBusqueda, obtenerUsuarios);

// GET /api/usuarios/:id -> un usuario
router.get('/:id', validarId, cargarUsuario, obtenerUsuarioId);

// POST /api/usuarios -> alta
router.post('/', validarAlta, verificarRol, crearUsuario);

// PUT /api/usuarios/:id -> modificacion
router.put(
  '/:id',
  validarId,
  validarModificacion,
  cargarUsuario,
  verificarRol,
  verificarRolPropio,
  modificarUsuario
);

// DELETE /api/usuarios/:id -> baja, salvo la del usuario de la sesion
router.delete('/:id', validarId, cargarUsuario, verificarNoEsPropio, bajaUsuario);

module.exports = router;
