const { sequelize, Proveedor } = require("../models")
const { fn, col } = require('sequelize');
const { contiene } = require('../utils/busqueda');

// Las verificaciones corren antes, en middlewares/proveedoresMiddleware.js:
// req.body llega validado y limpio, y req.proveedor es el proveedor de :nombre.

// Cuenta de articulos asociados: la tabla del ABM la muestra y explica por que
// una baja puede quedar frenada por la clave foranea (ON DELETE RESTRICT). Los
// articulos se unen sin traer sus columnas y se cuentan por proveedor; un
// proveedor sin articulos cuenta 0.
const CON_CANTIDAD_ARTICULOS = {
  attributes: { include: [[fn('COUNT', col('productos.id')), 'cantidadArticulos']] },
  include: [{ association: 'productos', attributes: [] }],
  group: ['Proveedor.id'],
};

// Sin texto buscado trae todos los proveedores.
const obtenerProveedores = async (req, res) => {
  const proveedores = await Proveedor.findAll({
    where: contiene('Proveedor.nombre', req.query.buscar),
    ...CON_CANTIDAD_ARTICULOS,
    order: [['nombre', 'ASC']],
  });

  res.json(proveedores);
}

const obtenerProvNombre = async (req, res) => {
  res.json(await req.proveedor.reload(CON_CANTIDAD_ARTICULOS));
}

// Alta, modificacion y baja van en una transaccion: el hook del modelo
// registra el movimiento dentro de ella, asi la operacion y su movimiento se
// guardan juntos o no se guarda ninguno. El movimiento lleva el usuario de la
// sesion.
const crearProveedor = async (req, res) => {
  const proveedor = await sequelize.transaction((transaction) =>
    Proveedor.create(req.body, { transaction, autor: req.sesion.autor() })
  );
  res.status(201).json(await proveedor.reload(CON_CANTIDAD_ARTICULOS));
}

const modificarProveedor = async (req, res) => {
  await sequelize.transaction((transaction) =>
    req.proveedor.update(req.body, { transaction, autor: req.sesion.autor() })
  );
  res.json(await req.proveedor.reload(CON_CANTIDAD_ARTICULOS));
}

const bajaProveedor = async (req, res) => {
  await sequelize.transaction((transaction) =>
    req.proveedor.destroy({ transaction, autor: req.sesion.autor() })
  );
  res.status(204).end();
}

module.exports = {
    obtenerProveedores,
    obtenerProvNombre,
    crearProveedor,
    modificarProveedor,
    bajaProveedor,
}
