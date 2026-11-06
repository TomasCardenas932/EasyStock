const { Op } = require('sequelize');
const { sequelize, Producto, Proveedor } = require('../models');
const { contiene } = require('../utils/busqueda');

// El proveedor viaja como objeto anidado: la tabla del ABM muestra el nombre.
const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

// El JOIN con proveedores trae otra columna `nombre`: sin calificar, SQLite la
// rechaza por ambigua.
const obtenerProductos = async (req, res) => {
  const { buscar } = req.query;
  const productos = await Producto.findAll({
    where: { [Op.or]: [contiene('Producto.codigo', buscar), contiene('Producto.nombre', buscar)] },
    include: INCLUIR_PROVEEDOR,
    order: [['nombre', 'ASC']],
  });

  res.json(productos);
};

const obtenerProdCodigo = async (req, res) => {
  res.json(await req.producto.reload({ include: INCLUIR_PROVEEDOR }));
};

// El usuario de la sesion queda en el movimiento de cada operacion.
const crearProducto = async (req, res) => {
  const producto = await sequelize.transaction((transaction) =>
    Producto.create(req.body, { transaction, autor: req.sesion.autor() })
  );
  res.status(201).json(await producto.reload({ include: INCLUIR_PROVEEDOR }));
};

const modificarProducto = async (req, res) => {
  await sequelize.transaction((transaction) =>
    req.producto.update(req.body, { transaction, autor: req.sesion.autor() })
  );
  res.json(await req.producto.reload({ include: INCLUIR_PROVEEDOR }));
};

const bajaProducto = async (req, res) => {
  await sequelize.transaction((transaction) =>
    req.producto.destroy({ transaction, autor: req.sesion.autor() })
  );
  res.status(204).end();
};

module.exports = {
  obtenerProductos,
  obtenerProdCodigo,
  crearProducto,
  modificarProducto,
  bajaProducto,
};
