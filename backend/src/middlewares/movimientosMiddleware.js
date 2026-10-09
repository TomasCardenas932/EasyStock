const Joi = require('joi');
const { validar } = require('./validar');

const SOLO_FECHA_O_IDENTIFICADOR =
  'Busca por fecha (dd/mm/aaaa) o por numero de identificador (#302)';

// GET /?buscar=texto del registro de movimientos. Se busca solo por:
// - numero de identificador: "#302" trae venta#302, alta#302, etc.
// - fecha, completa o el principio: "07/10/2026", "07/10" o "07".
// Sin texto (o con un "#" solo, mientras se escribe el numero) queda '' y el
// listado trae todo.
const validarBusqueda = validar({
  query: Joi.object({
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
  }),
});

module.exports = {
  validarBusqueda,
};
