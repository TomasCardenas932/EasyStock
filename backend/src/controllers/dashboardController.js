const { Op, col } = require('sequelize');
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
// 0, tengan o no umbral. Los bajos tienen umbral de 1 o mas: su stock es
// mayor a 0 e igual o menor al umbral.
const cociente = ({ stock, umbralMinimo }) => (stock === 0 ? 0 : stock / umbralMinimo);
const compararCodigo = (a, b) => (a.codigo < b.codigo ? -1 : Number(a.codigo > b.codigo));
const porUrgencia = (a, b) =>
  Number(a.stock > 0) - Number(b.stock > 0) || cociente(a) - cociente(b) || compararCodigo(a, b);

const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

// Regla 2: un articulo sin precio al publico no se puede vender.
const SIN_PRECIO = { precioPublico: null };

// Recuadros y listas de reposicion y de articulos sin precio del Dashboard
// (FRD, SC001). Los articulos para reponer se ordenan aca: el cociente entre
// stock y umbral no se puede pedir como orden a Sequelize sin escribir SQL.
const obtenerResumen = async (req, res) => {
  const [articulos, sinStock, sinPrecio, todosParaReponer, articulosSinPrecio] = await Promise.all([
    Producto.count(),
    Producto.count({ where: { stock: 0 } }),
    Producto.count({ where: SIN_PRECIO }),
    Producto.findAll({ where: PARA_REPONER, include: INCLUIR_PROVEEDOR }),
    Producto.findAll({
      where: SIN_PRECIO,
      include: INCLUIR_PROVEEDOR,
      order: [['codigo', 'ASC']],
      limit: LIMITE_LISTA,
    }),
  ]);
  const reponer = todosParaReponer.sort(porUrgencia).slice(0, LIMITE_LISTA);

  res.json({
    articulos,
    sinStock,
    paraReponer: todosParaReponer.length,
    sinPrecio,
    reponer,
    articulosSinPrecio,
  });
};

module.exports = {
  obtenerResumen,
};
