const jwt = require('jsonwebtoken');
const { col, fn, where } = require('sequelize');
const { Usuario, Rol, Permiso } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { secreto } = require('../config/sesion');
const { validar } = require('./validar');
const { esquemaCredenciales } = require('../schemas/sesionSchema');

// FRD, regla 14: se rechaza el ingreso sin indicar cual de los dos datos fallo.
const CREDENCIALES_INVALIDAS = 'Usuario o contrasena incorrectos.';

const SIN_SESION = 'Tenes que iniciar sesion para continuar';

// Solo los nombres de los permisos: es lo que revisa requierePermiso.
const INCLUIR_PERMISOS = {
  model: Rol,
  as: 'rol',
  attributes: ['id'],
  include: { model: Permiso, as: 'permisos', attributes: ['nombre'], through: { attributes: [] } },
};

const validarCredenciales = validar({ body: esquemaCredenciales });

// Busca al usuario por nombre, sin distinguir mayusculas, y lo deja en
// req.usuario si la contrasena coincide. El nombre no es unico: se prueba la
// contrasena con cada usuario que se llame asi.
const verificarCredenciales = async (req, res, next) => {
  const { nombre, contrasena } = req.body;
  const candidatos = await Usuario.scope('conContrasena').findAll({
    where: where(fn('lower', col('nombre')), nombre.toLowerCase()),
  });

  for (const candidato of candidatos) {
    if (await candidato.verificarContrasena(contrasena)) {
      req.usuario = candidato;
      return next();
    }
  }

  throw new ErrorHttp(401, CREDENCIALES_INVALIDAS);
};

// FRD, regla 15: sin sesion no se accede a nada. El token viaja en el
// encabezado "Authorization: Bearer <token>"; si es valido y el usuario
// todavia existe, queda en req.sesion con los permisos de su rol. Los
// permisos se leen en cada pedido: un cambio de rol vale sin volver a
// iniciar sesion.
const requiereSesion = async (req, res, next) => {
  const [tipo, token] = (req.get('Authorization') ?? '').split(' ');

  let datos;
  try {
    datos = jwt.verify(token, secreto);
  } catch {
    throw new ErrorHttp(401, SIN_SESION);
  }

  const usuario =
    tipo === 'Bearer' ? await Usuario.findByPk(datos.id, { include: INCLUIR_PERMISOS }) : null;
  if (!usuario) {
    throw new ErrorHttp(401, SIN_SESION);
  }

  req.sesion = usuario;
  next();
};

// El rol de la sesion tiene que tener alguno de los permisos indicados: los
// de las pantallas que usan el pedido (config/permisos.js). Sin rol no hay
// permisos. Corre despues de requiereSesion.
const requierePermiso =
  (...nombres) =>
  (req, res, next) => {
    const permisos = req.sesion.rol?.permisos.map((permiso) => permiso.nombre) ?? [];

    if (!nombres.some((nombre) => permisos.includes(nombre))) {
      throw new ErrorHttp(
        403,
        `Tu rol no tiene permiso para esta operacion (hace falta: ${nombres.join(' o ')})`
      );
    }

    next();
  };

module.exports = {
  validarCredenciales,
  verificarCredenciales,
  requiereSesion,
  requierePermiso,
};
