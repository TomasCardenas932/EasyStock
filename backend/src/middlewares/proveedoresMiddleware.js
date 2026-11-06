const { Proveedor } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaNombre, esquemaAlta, esquemaModificacion } = require('../schemas/proveedoresSchema');

const validarNombre = validar({ params: esquemaNombre });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

const cargarProveedor = async (req, res, next) => {
  const { nombre } = req.params;
  const proveedor = await Proveedor.findOne({ where: { nombre } });

  if (!proveedor) {
    throw new ErrorHttp(404, `No existe un proveedor con el nombre ${nombre}`);
  }

  req.proveedor = proveedor;
  next();
};

module.exports = {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarProveedor,
};
