const { sequelize, Rol, Permiso } = require('../models');

// Las verificaciones corren antes, en middlewares/rolesMiddleware.js:
// req.body llega validado y limpio, req.rol es el rol de :nombre y
// req.permisos son los permisos de req.body.permisoIds, ya buscados.

// Los permisos viajan como lista anidada, sin los datos de rol_permisos.
const INCLUIR_PERMISOS = {
  model: Permiso,
  as: 'permisos',
  attributes: ['id', 'nombre'],
  through: { attributes: [] },
};

const ORDEN = [
  ['nombre', 'ASC'],
  [{ model: Permiso, as: 'permisos' }, 'nombre', 'ASC'],
];

const obtenerRoles = async (req, res) => {
  res.json(await Rol.findAll({ include: INCLUIR_PERMISOS, order: ORDEN }));
};

const obtenerRolNombre = async (req, res) => {
  res.json(await req.rol.reload({ include: INCLUIR_PERMISOS, order: ORDEN }));
};

// El rol y sus permisos se guardan juntos o no se guarda ninguno.
const crearRol = async (req, res) => {
  const rol = await sequelize.transaction(async (transaction) => {
    const nuevo = await Rol.create(req.body, { transaction });
    await nuevo.setPermisos(req.permisos, { transaction });
    return nuevo;
  });
  res.status(201).json(await rol.reload({ include: INCLUIR_PERMISOS, order: ORDEN }));
};

const modificarRol = async (req, res) => {
  await req.rol.update(req.body);
  res.json(await req.rol.reload({ include: INCLUIR_PERMISOS, order: ORDEN }));
};

// Reemplaza los permisos del rol por los de la lista: borra los que no estan
// y agrega los nuevos, en una sola transaccion.
const asignarPermisos = async (req, res) => {
  await sequelize.transaction((transaction) =>
    req.rol.setPermisos(req.permisos, { transaction })
  );
  res.json(await req.rol.reload({ include: INCLUIR_PERMISOS, order: ORDEN }));
};

// La clave foranea de rol_permisos (ON DELETE CASCADE) borra sus
// asignaciones de permisos.
const bajaRol = async (req, res) => {
  await req.rol.destroy();
  res.status(204).end();
};

module.exports = {
  obtenerRoles,
  obtenerRolNombre,
  crearRol,
  modificarRol,
  asignarPermisos,
  bajaRol,
};
