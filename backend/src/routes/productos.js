'use strict';

const { Router } = require('express');
const { literal } = require('sequelize');
const { Producto, Proveedor } = require('../../models');

const router = Router();

const CAMPOS_EDITABLES = ['codigo', 'nombre', 'stock', 'costo', 'precioPublico', 'proveedorId'];

// El proveedor viaja como objeto anidado: la tabla del ABM muestra el nombre.
const INCLUIR_PROVEEDOR = { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] };

// Toma del body solo los campos permitidos y limpia los textos.
function leerDatos(body = {}) {
  const datos = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] === undefined) continue;
    const valor = body[campo];
    datos[campo] = typeof valor === 'string' ? valor.trim() : valor;
  }
  if (datos.proveedorId === '') datos.proveedorId = null;
  return datos;
}

// El codigo solo es unico dentro de un proveedor. Si dos proveedores usan el
// mismo, la operacion se frena en vez de elegir un articulo al azar.
async function buscarPorCodigo(req, res) {
  const codigo = req.params.codigo.trim();
  const productos = await Producto.findAll({
    where: { codigo },
    include: INCLUIR_PROVEEDOR,
  });

  if (productos.length === 0) {
    res.status(404).json({ error: `No existe un producto con el codigo ${codigo}` });
    return null;
  }

  if (productos.length > 1) {
    res.status(409).json({
      error: `Hay ${productos.length} articulos con el codigo ${codigo}: indica de que proveedor es.`,
      candidatos: productos.map((producto) => ({
        id: producto.id,
        proveedorId: producto.proveedorId,
        proveedor: producto.proveedor?.nombre ?? null,
      })),
    });
    return null;
  }

  return productos[0];
}

// Escapa los comodines de LIKE (% y _) para buscarlos como texto literal.
// El caracter de escape es "!" y no "\\": Sequelize descarta la barra invertida
// al interpolar el literal y SQLite termina recibiendo ESCAPE ''.
const ESCAPE_LIKE = '!';

function patronBusqueda(texto) {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
}

// Las columnas van calificadas con el alias del modelo: el JOIN con proveedores
// trae otra columna `nombre` y sin calificar SQLite la rechaza por ambigua.
const FILTRO_BUSQUEDA =
  "(`Producto`.`codigo` LIKE :patron ESCAPE '!' OR `Producto`.`nombre` LIKE :patron ESCAPE '!')";

// GET /api/productos?buscar=texto -> lista de articulos, filtrada por codigo o nombre
router.get('/', async (req, res) => {
  const buscado = String(req.query.buscar ?? '').trim();

  const productos = await Producto.findAll({
    where: buscado ? literal(FILTRO_BUSQUEDA) : undefined,
    replacements: { patron: patronBusqueda(buscado) },
    include: INCLUIR_PROVEEDOR,
    order: [['nombre', 'ASC']],
  });

  res.json(productos);
});

// GET /api/productos/:codigo -> un articulo
router.get('/:codigo', async (req, res) => {
  const producto = await buscarPorCodigo(req, res);
  if (producto) res.json(producto);
});

// POST /api/productos -> alta
router.post('/', async (req, res) => {
  const producto = await Producto.create(leerDatos(req.body));
  res.status(201).json(await producto.reload({ include: INCLUIR_PROVEEDOR }));
});

// PUT /api/productos/:codigo -> modificacion
router.put('/:codigo', async (req, res) => {
  const producto = await buscarPorCodigo(req, res);
  if (!producto) return;
  await producto.update(leerDatos(req.body));
  res.json(await producto.reload({ include: INCLUIR_PROVEEDOR }));
});

// DELETE /api/productos/:codigo -> baja
router.delete('/:codigo', async (req, res) => {
  const producto = await buscarPorCodigo(req, res);
  if (!producto) return;
  await producto.destroy();
  res.status(204).end();
});

module.exports = router;
