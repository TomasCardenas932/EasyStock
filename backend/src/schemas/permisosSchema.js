const Joi = require('joi');

const nombre = () => Joi.string().trim().label('El nombre del permiso');

const esquemaNombre = Joi.object({ nombre: nombre().required() });

const esquemaAlta = Joi.object({ nombre: nombre().required() });

// En la modificacion viajan solo los campos que cambian.
const esquemaModificacion = Joi.object({ nombre: nombre() });

module.exports = {
  esquemaNombre,
  esquemaAlta,
  esquemaModificacion,
};
