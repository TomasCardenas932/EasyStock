const Joi = require('joi');

const SOLO_FECHA_O_IDENTIFICADOR =
  'Busca por fecha (dd/mm/aaaa) o por numero de identificador (#302)';

const esquemaBusqueda = Joi.object({
  buscar: Joi.string()
    .trim()
    .replace(/^#$/, '')
    // Dia y mes de un digito se completan con un cero, como los muestra la
    // pantalla: "7/1/2026" busca "07/01/2026".
    .replace(/(?<inicio>^|\/)(?<digito>\d)(?=\/)/g, '$<inicio>0$<digito>')
    .pattern(/^(#\d+|[\d/]*)$/)
    .allow('')
    .default('')
    .label('La busqueda')
    .messages({ 'string.pattern.base': SOLO_FECHA_O_IDENTIFICADOR }),
});

// Entrada de stock (FRD, regla 7): unidades que se suman a un articulo, con la
// factura o el remito como referencia opcional. Vacia viaja como null.
const esquemaEntrada = Joi.object({
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
  referencia: Joi.string()
    .trim()
    .max(100)
    .allow(null)
    .empty('')
    .default(null)
    .label('La referencia')
    .messages({ 'string.max': '{#label} no puede tener mas de {#limit} caracteres' }),
});

module.exports = {
  esquemaBusqueda,
  esquemaEntrada,
};
