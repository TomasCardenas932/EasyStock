'use strict';

const { Router } = require('express');
const { literal } = require('sequelize');
const { Proveedor } = require('../../models');

const router = Router();

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
function leerDatos(body = {}) {
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
async function buscarPorNombre(req, res) {
  const nombre = req.params.nombre.trim();
  const proveedor = await Proveedor.findOne({ where: { nombre }, attributes: ATRIBUTOS });

  if (!proveedor) {
    res.status(404).json({ error: `No existe un proveedor con el nombre ${nombre}` });
    return null;
  }

  return proveedor;
}

// Escapa los comodines de LIKE (% y _) para buscarlos como texto literal.
// El caracter de escape es "!" y no "\\": Sequelize descarta la barra invertida
// al interpolar el literal y SQLite termina recibiendo ESCAPE ''.
const ESCAPE_LIKE = '!';

function patronBusqueda(texto) {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
}

const FILTRO_BUSQUEDA = "`Proveedor`.`nombre` LIKE :patron ESCAPE '!'";

// GET /api/proveedores?buscar=texto -> lista de proveedores, filtrada por nombre.
// Tambien alimenta el selector de proveedores del ABM de articulos.
router.get('/', async (req, res) => {
  const buscado = String(req.query.buscar ?? '').trim();

  const proveedores = await Proveedor.findAll({
    where: buscado ? literal(FILTRO_BUSQUEDA) : undefined,
    replacements: { patron: patronBusqueda(buscado) },
    attributes: ATRIBUTOS,
    order: [['nombre', 'ASC']],
  });

  res.json(proveedores);
});

// GET /api/proveedores/:nombre -> un proveedor
router.get('/:nombre', async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (proveedor) res.json(proveedor);
});

// POST /api/proveedores -> alta
router.post('/', async (req, res) => {
  const proveedor = await Proveedor.create(leerDatos(req.body));
  res.status(201).json(await proveedor.reload({ attributes: ATRIBUTOS }));
});

// PUT /api/proveedores/:nombre -> modificacion
router.put('/:nombre', async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (!proveedor) return;
  await proveedor.update(leerDatos(req.body));
  res.json(await proveedor.reload({ attributes: ATRIBUTOS }));
});

// DELETE /api/proveedores/:nombre -> baja.
// Si todavia tiene articulos cargados la clave foranea la rechaza y el manejador
// de errores de app.js responde 409.
router.delete('/:nombre', async (req, res) => {
  const proveedor = await buscarPorNombre(req, res);
  if (!proveedor) return;
  await proveedor.destroy();
  res.status(204).end();
});

module.exports = router;
