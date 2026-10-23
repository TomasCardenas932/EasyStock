const { Op, col, literal } = require('sequelize');
const { Producto, Proveedor } = require('../models');

// Cuantos articulos para reponer muestra el Dashboard: los mas urgentes.
const LIMITE_REPONER = 6;

// Reglas C1 y C2 del FRD: stock igual o menor al umbral minimo. Los que no
// tienen umbral quedan afuera (regla C4), aunque esten sin stock.
const PARA_REPONER = {
  umbralMinimo: { [Op.ne]: null },
  stock: { [Op.lte]: col('umbral_minimo') },
};

// Primero los sin stock (C1) y despues los bajos (C2); dentro de cada regla,
// por el cociente entre stock y umbral, de menor a mayor. El codigo desempata
// los sin stock, que tienen todos cociente 0. Con umbral 0 SQLite da NULL al
// dividir: solo pasa sin stock, asi que cuenta como 0.
const ORDEN_URGENCIA = [
  [literal('`Producto`.`stock` = 0'), 'DESC'],
  [literal('COALESCE(CAST(`Producto`.`stock` AS REAL) / `Producto`.`umbral_minimo`, 0)'), 'ASC'],
  ['codigo', 'ASC'],
];

const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

// Recuadros y lista de reposicion del Dashboard (FRD, SC001).
const obtenerResumen = async (req, res) => {
  const [articulos, sinStock, paraReponer, sinPrecio, reponer] = await Promise.all([
    Producto.count(),
    Producto.count({ where: { stock: 0 } }),
    Producto.count({ where: PARA_REPONER }),
    Producto.count({ where: { precioPublico: null } }),
    Producto.findAll({
      where: PARA_REPONER,
      include: INCLUIR_PROVEEDOR,
      order: ORDEN_URGENCIA,
      limit: LIMITE_REPONER,
    }),
  ]);

  res.json({ articulos, sinStock, paraReponer, sinPrecio, reponer });
};

module.exports = {
  obtenerResumen,
};
