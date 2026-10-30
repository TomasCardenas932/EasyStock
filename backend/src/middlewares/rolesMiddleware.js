const { Rol, Permiso, Usuario } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { USUARIOS } = require('../config/permisos');
const { validar } = require('./validar');
const {
  esquemaNombre,
  esquemaAlta,
  esquemaModificacion,
  esquemaPermisos,
} = require('../schemas/rolesSchema');

const validarNombre = validar({ params: esquemaNombre });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

const validarPermisos = validar({ body: esquemaPermisos });

// Busca el rol de :nombre y lo deja en req.rol.
const cargarRol = async (req, res, next) => {
  const { nombre } = req.params;
  const rol = await Rol.findOne({ where: { nombre } });

  if (!rol) {
    throw new ErrorHttp(404, `No existe un rol con el nombre ${nombre}`);
  }

  req.rol = rol;
  next();
};

// Busca los permisos de req.body.permisoIds y los deja en req.permisos. Si
// alguno no existe no se asigna ninguno.
const cargarPermisos = async (req, res, next) => {
  const { permisoIds } = req.body;
  const permisos = await Permiso.findAll({ where: { id: permisoIds } });
  const encontrados = new Set(permisos.map((permiso) => permiso.id));
  const faltantes = permisoIds.filter((id) => !encontrados.has(id));

  if (faltantes.length > 0) {
    throw new ErrorHttp(404, `No existe el permiso con id ${faltantes.join(', ')}`, {
      detalles: [{ campo: 'permisoIds', mensaje: 'Selecciona permisos validos' }],
    });
  }

  req.permisos = permisos;
  next();
};

// El usuario de la sesion no puede quitarle a su propio rol el permiso
// Usuarios: perderia la pantalla en el pedido siguiente, igual que todos los
// que comparten el rol, y si no queda otro rol con Usuarios nadie podria
// devolverselo. Corre despues de cargarRol y cargarPermisos.
const verificarPermisosPropios = (req, res, next) => {
  const conservaUsuarios = req.permisos.some((permiso) => permiso.nombre === USUARIOS);

  if (req.rol.id === req.sesion.rolId && !conservaUsuarios) {
    throw new ErrorHttp(409, `No podes quitarle el permiso ${USUARIOS} a tu propio rol`, {
      detalles: [{ campo: 'permisoIds', mensaje: 'Pedile a otro administrador que lo cambie' }],
    });
  }

  next();
};

// La clave foranea de usuarios (ON DELETE RESTRICT) frenaria la baja igual;
// aca se corta antes para explicar el motivo.
const verificarSinUsuarios = async (req, res, next) => {
  const cantidad = await Usuario.count({ where: { rolId: req.rol.id } });

  if (cantidad > 0) {
    throw new ErrorHttp(
      409,
      `El rol ${req.rol.nombre} tiene ${cantidad} usuario(s) asignado(s): cambiales el rol antes de darlo de baja`
    );
  }

  next();
};

module.exports = {
  validarNombre,
  validarAlta,
  validarModificacion,
  validarPermisos,
  cargarRol,
  cargarPermisos,
  verificarPermisosPropios,
  verificarSinUsuarios,
};
