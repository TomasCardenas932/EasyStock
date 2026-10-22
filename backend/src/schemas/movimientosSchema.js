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

module.exports = {
  esquemaBusqueda,
};
