const { sequelize, Proveedor } = require("../models")
const { literal } = require('sequelize');

// Las verificaciones corren antes, en middlewares/proveedoresMiddleware.js:
// req.body llega validado y limpio, y req.proveedor es el proveedor de :nombre.

// Cuenta de articulos asociados: la tabla del ABM la muestra y explica por que
// una baja puede quedar frenada por la clave foranea (ON DELETE RESTRICT).
const CANTIDAD_ARTICULOS = [
  literal(
    '(SELECT COUNT(*) FROM `productos` WHERE `productos`.`proveedor_id` = `Proveedor`.`id`)'
  ),
  'cantidadArticulos',
];

const ATRIBUTOS = { include: [CANTIDAD_ARTICULOS] };

// Escapa los comodines de LIKE (% y _) para buscarlos como texto literal.
// El caracter de escape es "!" y no "\\": Sequelize descarta la barra invertida
// al interpolar el literal y SQLite termina recibiendo ESCAPE ''.
const ESCAPE_LIKE = '!';

const patronBusqueda = (texto) => {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
}

// Sin texto buscado el patron queda '%%' y trae todos los proveedores.
const FILTRO_BUSQUEDA = "`Proveedor`.`nombre` LIKE :patron ESCAPE '!'";

const obtenerProveedores = async (req, res) => {
  const proveedores = await Proveedor.findAll({
    where: literal(FILTRO_BUSQUEDA),
    replacements: { patron: patronBusqueda(req.query.buscar) },
    attributes: ATRIBUTOS,
    order: [['nombre', 'ASC']],
  });

  res.json(proveedores);
}

const obtenerProvNombre = async (req, res) => {
  res.json(await req.proveedor.reload({ attributes: ATRIBUTOS }));
}

// Alta, modificacion y baja van en una transaccion: el hook del modelo
// registra el movimiento dentro de ella, asi la operacion y su movimiento se
// guardan juntos o no se guarda ninguno.
const crearProveedor = async (req, res) => {
  const proveedor = await sequelize.transaction((transaction) =>
    Proveedor.create(req.body, { transaction })
  );
  res.status(201).json(await proveedor.reload({ attributes: ATRIBUTOS }));
}

const modificarProveedor = async (req, res) => {
  await sequelize.transaction((transaction) => req.proveedor.update(req.body, { transaction }));
  res.json(await req.proveedor.reload({ attributes: ATRIBUTOS }));
}

const bajaProveedor = async (req, res) => {
  await sequelize.transaction((transaction) => req.proveedor.destroy({ transaction }));
  res.status(204).end();
}

module.exports = {
    obtenerProveedores,
    obtenerProvNombre,
    crearProveedor,
    modificarProveedor,
    bajaProveedor,
}
