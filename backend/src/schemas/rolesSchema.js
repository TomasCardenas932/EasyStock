const Joi = require('joi');

const nombre = () => Joi.string().trim().label('El nombre del rol');

// Ids de los permisos del rol. La lista reemplaza a la anterior entera.
const permisoIds = () =>
  Joi.array()
    .items(
      Joi.number()
        .integer()
        .min(1)
        .label('El permiso')
        .messages({ 'number.min': '{#label} no es valido' })
    )
    .unique()
    .label('Los permisos')
    .messages({
      'array.base': '{#label} deben ser una lista',
      'array.unique': 'Hay permisos repetidos',
      'any.required': 'Hay que indicar los permisos del rol',
    });

const esquemaNombre = Joi.object({ nombre: nombre().required() });

// Sin permisos, el rol se da de alta sin ninguno.
const esquemaAlta = Joi.object({
  nombre: nombre().required(),
  permisoIds: permisoIds().default([]),
});

// En la modificacion viajan solo los campos que cambian. Los permisos se
// cambian aparte, con esquemaPermisos.
const esquemaModificacion = Joi.object({ nombre: nombre() });

const esquemaPermisos = Joi.object({ permisoIds: permisoIds().required() });

module.exports = {
  esquemaNombre,
  esquemaAlta,
  esquemaModificacion,
  esquemaPermisos,
};
