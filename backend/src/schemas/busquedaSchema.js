const Joi = require('joi');

// Texto del buscador de los listados (?buscar=texto). Sin texto, trae todo.
const esquemaBusqueda = Joi.object({
  buscar: Joi.string().trim().allow('').default('').label('La busqueda'),
});

module.exports = {
  esquemaBusqueda,
};
