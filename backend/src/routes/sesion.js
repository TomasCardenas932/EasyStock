const { Router } = require('express');

const { iniciarSesion, obtenerSesion } = require('../controllers/sesionController');

const {
  validarCredenciales,
  verificarCredenciales,
  requiereSesion,
} = require('../middlewares/sesionMiddleware');

const router = Router();

// POST /api/sesion -> inicio de sesion: devuelve el token y el usuario
router.post('/', validarCredenciales, verificarCredenciales, iniciarSesion);

// GET /api/sesion -> usuario de la sesion actual, con su rol y permisos
router.get('/', requiereSesion, obtenerSesion);

module.exports = router;
