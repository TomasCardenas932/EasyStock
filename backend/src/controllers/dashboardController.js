const { Op, col } = require('sequelize');
const { Producto } = require('../models');

// Recuadros del Dashboard (FRD, SC001). Para reponer son los articulos de las
// reglas C1 y C2: stock igual o menor al umbral minimo. Los que no tienen
// umbral quedan afuera (regla C4), aunque esten sin stock.
const obtenerResumen = async (req, res) => {
  const [articulos, sinStock, paraReponer, sinPrecio] = await Promise.all([
    Producto.count(),
    Producto.count({ where: { stock: 0 } }),
    Producto.count({
      where: {
        umbralMinimo: { [Op.ne]: null },
        stock: { [Op.lte]: col('umbral_minimo') },
      },
    }),
    Producto.count({ where: { precioPublico: null } }),
  ]);

  res.json({ articulos, sinStock, paraReponer, sinPrecio });
};

module.exports = {
  obtenerResumen,
};
