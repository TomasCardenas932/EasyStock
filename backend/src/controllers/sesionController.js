const jwt = require('jsonwebtoken');
const { Rol, Permiso } = require('../models');
const { secreto, duracion } = require('../config/sesion');

// Las verificaciones corren antes, en middlewares/sesionMiddleware.js:
// req.usuario es el usuario cuyas credenciales coincidieron y req.sesion el
// usuario del token. La contrasena nunca sale en las respuestas.

// El usuario viaja con su rol y los permisos del rol: el frontend muestra el
// nombre en el encabezado y puede decidir que pantallas habilitar.
const INCLUIR_ROL = {
  model: Rol,
  as: 'rol',
  attributes: ['id', 'nombre'],
  include: {
    model: Permiso,
    as: 'permisos',
    attributes: ['id', 'nombre'],
    through: { attributes: [] },
  },
};

const iniciarSesion = async (req, res) => {
  const token = jwt.sign({ id: req.usuario.id }, secreto, { expiresIn: duracion });
  res.json({ token, usuario: await req.usuario.reload({ include: INCLUIR_ROL }) });
};

const obtenerSesion = async (req, res) => {
  res.json(await req.sesion.reload({ include: INCLUIR_ROL }));
};

module.exports = {
  iniciarSesion,
  obtenerSesion,
};
