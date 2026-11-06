const openapi = require('../docs/openapi');

// La especificacion que muestra Swagger UI, para importarla en otra
// herramienta (Postman, Insomnia...).
const obtenerEspecificacion = (req, res) => {
  res.json(openapi);
};

module.exports = {
  obtenerEspecificacion,
};
