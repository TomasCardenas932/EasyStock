const Joi = require('joi');
const { Proveedor } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');

const nombre = () => Joi.string().trim().label('El nombre');

const esquemaAlta = Joi.object({ nombre: nombre().required() });

// En la modificacion viajan solo los campos que cambian.
const esquemaModificacion = Joi.object({ nombre: nombre() });

const validarNombre = validar({
  params: Joi.object({ nombre: nombre().required() }),
});

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el proveedor de :nombre y lo deja en req.proveedor. El nombre es unico
// (indice `proveedores_nombre_unico`), asi que alcanza como clave de busqueda:
// no hace falta desambiguar como en productos.
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
