const Joi = require('joi');
const MENSAJES = require('./mensajes');

const SIN_ARTICULOS = 'La venta tiene que tener al menos un articulo';

const esquemaVenta = Joi.object({
  articulos: Joi.array()
    .items(
      Joi.object({
        productoId: Joi.number().integer().min(1).required().label('El articulo'),
        cantidad: Joi.number()
          .integer()
          .min(1)
          .required()
          .label('La cantidad')
          .messages({
            'any.required': '{#label} es obligatoria',
            'number.min': '{#label} debe ser mayor a 0',
          }),
      })
        .messages(MENSAJES)
    )
    .min(1)
    .required()
    .messages({
      'any.required': SIN_ARTICULOS,
      'array.base': SIN_ARTICULOS,
      'array.min': SIN_ARTICULOS,
    }),
});

module.exports = {
  esquemaVenta,
};
