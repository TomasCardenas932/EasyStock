const { Permiso } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaNombre, esquemaAlta, esquemaModificacion } = require('../schemas/permisosSchema');

const validarNombre = validar({ params: esquemaNombre });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el permiso de :nombre y lo deja en req.permiso.
const cargarPermiso = async (req, res, next) => {
  const { nombre } = req.params;
  const permiso = await Permiso.findOne({ where: { nombre } });

  if (!permiso) {
    throw new ErrorHttp(404, `No existe un permiso con el nombre ${nombre}`);
  }

  req.permiso = permiso;
  next();
};

module.exports = {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarPermiso,
};
