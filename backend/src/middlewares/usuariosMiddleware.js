const { Usuario, Rol } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaId, esquemaAlta, esquemaModificacion } = require('../schemas/usuariosSchema');

const validarId = validar({ params: esquemaId });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el usuario de :id y lo deja en req.usuario. Viene sin la contrasena
// (scope por defecto del modelo).
const cargarUsuario = async (req, res, next) => {
  const { id } = req.params;
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new ErrorHttp(404, `No existe un usuario con el id ${id}`);
  }

  req.usuario = usuario;
  next();
};

// Si se indica un rol, tiene que existir. Sin rolId, o con null, no hay nada
// que verificar.
const verificarRol = async (req, res, next) => {
  const { rolId } = req.body;

  if (rolId != null && !(await Rol.findByPk(rolId))) {
    throw new ErrorHttp(409, 'El rol indicado no existe', {
      detalles: [{ campo: 'rolId', mensaje: 'Selecciona un rol valido' }],
    });
  }

  next();
};

module.exports = {
  validarId,
  validarAlta,
  validarModificacion,
  cargarUsuario,
  verificarRol,
};
