// Mensajes en castellano, con el mismo texto que las validaciones de los
// modelos. {#label} es la etiqueta que cada esquema le pone a su campo.
// middlewares/validar.js los aplica a todos los esquemas.
const MENSAJES = {
  'any.required': '{#label} es obligatorio',
  'string.base': '{#label} debe ser un texto',
  'string.empty': '{#label} es obligatorio',
  'number.base': '{#label} debe ser un numero entero',
  'number.integer': '{#label} debe ser un numero entero',
  'number.unsafe': '{#label} es demasiado grande',
  'number.min': '{#label} no puede ser negativo',
  'object.base': 'El formato de los datos no es valido',
};

module.exports = MENSAJES;
