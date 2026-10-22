const { Router } = require('express');
const { validarBusqueda } = require('../middlewares/validar');

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
} = require('../middlewares/usuariosMiddleware');

const router = Router();

// GET /api/usuarios?buscar=texto -> lista de usuarios, filtrada por nombre o apellido
router.get('/', validarBusqueda, obtenerUsuarios);

// GET /api/usuarios/:id -> un usuario
router.get('/:id', validarId, cargarUsuario, obtenerUsuarioId);

// POST /api/usuarios -> alta
router.post('/', validarAlta, verificarRol, crearUsuario);

// PUT /api/usuarios/:id -> modificacion
router.put('/:id', validarId, validarModificacion, cargarUsuario, verificarRol, modificarUsuario);

// DELETE /api/usuarios/:id -> baja
router.delete('/:id', validarId, cargarUsuario, bajaUsuario);

module.exports = router;
