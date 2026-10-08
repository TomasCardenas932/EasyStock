const { literal } = require('sequelize');
const { sequelize, Producto, Proveedor } = require('../models');

// El proveedor viaja como objeto anidado: la tabla del ABM muestra el nombre.
const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

const ESCAPE_LIKE = '!';

const patronBusqueda = (texto) => {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
};

// Las columnas van calificadas con el alias del modelo: el JOIN con proveedores
// trae otra columna `nombre` y sin calificar SQLite la rechaza por ambigua.
// Sin texto buscado el patron queda '%%' y trae todos los articulos.
const FILTRO_BUSQUEDA =
  "(`Producto`.`codigo` LIKE :patron ESCAPE '!' OR `Producto`.`nombre` LIKE :patron ESCAPE '!')";

const obtenerProductos = async (req, res) => {
  const productos = await Producto.findAll({
    where: literal(FILTRO_BUSQUEDA),
    replacements: { patron: patronBusqueda(req.query.buscar) },
    include: INCLUIR_PROVEEDOR,
    order: [['nombre', 'ASC']],
  });

  res.json(productos);
};

const obtenerProdCodigo = async (req, res) => {
  res.json(await req.producto.reload({ include: INCLUIR_PROVEEDOR }));
};

// Alta, modificacion y baja van en una transaccion: el hook del modelo
// registra el movimiento dentro de ella, asi la operacion y su movimiento se
// guardan juntos o no se guarda ninguno.
const crearProducto = async (req, res) => {
  const producto = await sequelize.transaction((transaction) =>
    Producto.create(req.body, { transaction })
  );
  res.status(201).json(await producto.reload({ include: INCLUIR_PROVEEDOR }));
};

const modificarProducto = async (req, res) => {
  await sequelize.transaction((transaction) => req.producto.update(req.body, { transaction }));
  res.json(await req.producto.reload({ include: INCLUIR_PROVEEDOR }));
};

const bajaProducto = async (req, res) => {
  await sequelize.transaction((transaction) => req.producto.destroy({ transaction }));
  res.status(204).end();
};

module.exports = {
  obtenerProductos,
  obtenerProdCodigo,
  crearProducto,
  modificarProducto,
  bajaProducto,
};
