const { Producto } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaBusqueda, esquemaEntrada } = require('../schemas/movimientosSchema');

const validarBusqueda = validar({ query: esquemaBusqueda });

const validarEntrada = validar({ body: esquemaEntrada });

// Deja en req.producto el articulo al que se le suma el stock.
const cargarProductoEntrada = async (req, res, next) => {
  const producto = await Producto.findByPk(req.body.productoId);
  if (!producto) {
    throw new ErrorHttp(404, 'El articulo de la entrada ya no existe');
  }
  req.producto = producto;
  next();
};

module.exports = {
  validarBusqueda,
  validarEntrada,
  cargarProductoEntrada,
};
