const {Proveedor} = require("../models")
const { literal } = require('sequelize');

const CAMPOS_EDITABLES = ['nombre'];

// Cuenta de articulos asociados: la tabla del ABM la muestra y explica por que
// una baja puede quedar frenada por la clave foranea (ON DELETE RESTRICT).
const CANTIDAD_ARTICULOS = [
  literal(
    '(SELECT COUNT(*) FROM `productos` WHERE `productos`.`proveedor_id` = `Proveedor`.`id`)'
  ),
  'cantidadArticulos',
];

const ATRIBUTOS = { include: [CANTIDAD_ARTICULOS] };

// Toma del body solo los campos permitidos y limpia los textos.
const leerDatos= (body = {}) => {
  const datos = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] === undefined) continue;
    const valor = body[campo];
    datos[campo] = typeof valor === 'string' ? valor.trim() : valor;
  }
  return datos;
}

// El nombre es unico (indice `proveedores_nombre_unico`), asi que alcanza como
// clave de busqueda: no hace falta desambiguar como en productos.
const buscarPorNombre = async (req, res) => {
  const { nombre } = req.params;
  const proveedor = await Proveedor.findOne({
    where: { nombre },
    attributes: ATRIBUTOS,
  });

  if (!proveedor) {
    res.status(404).json({ error: `No existe un proveedor con el nombre ${nombre}` });
    return null
  }

  return(proveedor);
};

// Escapa los comodines de LIKE (% y _) para buscarlos como texto literal.
// El caracter de escape es "!" y no "\\": Sequelize descarta la barra invertida
// al interpolar el literal y SQLite termina recibiendo ESCAPE ''.
const ESCAPE_LIKE = '!';

const patronBusqueda = (texto) => {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
}

const FILTRO_BUSQUEDA = "`Proveedor`.`nombre` LIKE :patron ESCAPE '!'";

const obtenerProveedores = async (req, res) => {
  const buscado = String(req.query.buscar ?? '').trim();

  const proveedores = await Proveedor.findAll({
    where: buscado ? literal(FILTRO_BUSQUEDA) : undefined,
    replacements: { patron: patronBusqueda(buscado) },
    attributes: ATRIBUTOS,
    order: [['nombre', 'ASC']],
  });

  res.json(proveedores);
}

const obtenerProvNombre = async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (proveedor) res.json(proveedor);
}

const crearProveedor = async (req, res) => {
  const proveedor = await Proveedor.create(leerDatos(req.body));
  res.status(201).json(await proveedor.reload({ attributes: ATRIBUTOS }));
}

const modificarProveedor = async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (!proveedor) 
    return;
  await proveedor.update(leerDatos(req.body));
  res.json(await proveedor.reload({ attributes: ATRIBUTOS }));
}

const bajaProveedor = async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (!proveedor) return;
  await proveedor.destroy();
  res.status(204).end();
}

module.exports = {
    obtenerProveedores,
    obtenerProvNombre,
    crearProveedor,
    modificarProveedor,
    bajaProveedor,
}