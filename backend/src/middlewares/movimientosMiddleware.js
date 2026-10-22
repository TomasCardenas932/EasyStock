const { validar } = require('./validar');
const { esquemaBusqueda } = require('../schemas/movimientosSchema');

const validarBusqueda = validar({ query: esquemaBusqueda });

module.exports = {
  validarBusqueda,
};
