const { Op, col, literal } = require('sequelize');
const { Producto, Proveedor } = require('../models');

// Cuantos articulos muestra cada lista del Dashboard: para reponer, los mas
// urgentes; sin precio, los primeros por codigo.
const LIMITE_LISTA = 6;

// Todos los articulos sin stock, tengan o no umbral minimo, y los que tienen
// el stock igual o menor a su umbral (reglas C1 y C2 del FRD). De los que no
// tienen umbral (regla C4) solo entran los que estan sin stock.
const PARA_REPONER = {
  [Op.or]: [
    { stock: 0 },
    { umbralMinimo: { [Op.ne]: null }, stock: { [Op.lte]: col('umbral_minimo') } },
  ],
};

// Primero los sin stock, que son los mas urgentes, y despues los bajos;
// dentro de cada grupo, por el cociente entre stock y umbral, de menor a
// mayor. El codigo desempata los sin stock, que cuentan todos como cociente
// 0: sin umbral, o con umbral 0, SQLite da NULL al dividir.
const ORDEN_URGENCIA = [
  [literal('`Producto`.`stock` = 0'), 'DESC'],
  [literal('COALESCE(CAST(`Producto`.`stock` AS REAL) / `Producto`.`umbral_minimo`, 0)'), 'ASC'],
  ['codigo', 'ASC'],
];

const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

// Regla 2: un articulo sin precio al publico no se puede vender.
const SIN_PRECIO = { precioPublico: null };

// Recuadros y listas de reposicion y de articulos sin precio del Dashboard
// (FRD, SC001).
const obtenerResumen = async (req, res) => {
  const [articulos, sinStock, paraReponer, sinPrecio, reponer, articulosSinPrecio] =
    await Promise.all([
      Producto.count(),
      Producto.count({ where: { stock: 0 } }),
      Producto.count({ where: PARA_REPONER }),
      Producto.count({ where: SIN_PRECIO }),
      Producto.findAll({
        where: PARA_REPONER,
        include: INCLUIR_PROVEEDOR,
        order: ORDEN_URGENCIA,
        limit: LIMITE_LISTA,
      }),
      Producto.findAll({
        where: SIN_PRECIO,
        include: INCLUIR_PROVEEDOR,
        order: [['codigo', 'ASC']],
        limit: LIMITE_LISTA,
      }),
    ]);

  res.json({ articulos, sinStock, paraReponer, sinPrecio, reponer, articulosSinPrecio });
};

module.exports = {
  obtenerResumen,
};
