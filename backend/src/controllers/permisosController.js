const { Permiso } = require('../models');

// Las verificaciones corren antes, en middlewares/permisosMiddleware.js:
// req.body llega validado y limpio, y req.permiso es el permiso de :nombre.

const obtenerPermisos = async (req, res) => {
  res.json(await Permiso.findAll({ order: [['nombre', 'ASC']] }));
};

const obtenerPermisoNombre = async (req, res) => {
  res.json(req.permiso);
};

const crearPermiso = async (req, res) => {
  res.status(201).json(await Permiso.create(req.body));
};

const modificarPermiso = async (req, res) => {
  res.json(await req.permiso.update(req.body));
};

// La clave foranea de rol_permisos (ON DELETE CASCADE) le quita el permiso a
// los roles que lo tenian.
const bajaPermiso = async (req, res) => {
  await req.permiso.destroy();
  res.status(204).end();
};

module.exports = {
  obtenerPermisos,
  obtenerPermisoNombre,
  crearPermiso,
  modificarPermiso,
  bajaPermiso,
};
