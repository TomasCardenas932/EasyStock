'use strict';

const { Router } = require('express');
const { Producto } = require('../../models');

const router = Router();

const CAMPOS_EDITABLES = ['codigo', 'nombre', 'stock', 'costo', 'precioPublico', 'proveedor'];

// Toma del body solo los campos permitidos y limpia los textos.
function leerDatos(body = {}) {
  const datos = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] === undefined) continue;
    const valor = body[campo];
    datos[campo] = typeof valor === 'string' ? valor.trim() : valor;
  }
  if (datos.proveedor === '') datos.proveedor = null;
  return datos;
}

async function buscarPorCodigo(req, res) {
  const producto = await Producto.findOne({ where: { codigo: req.params.codigo.trim() } });
  if (!producto) {
    res.status(404).json({ error: `No existe un producto con el codigo ${req.params.codigo}` });
  }
  return producto;
}

// GET /api/productos -> lista completa de articulos
router.get('/', async (req, res) => {
  const productos = await Producto.findAll({ order: [['nombre', 'ASC']] });
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
  res.status(201).json(producto);
});

// PUT /api/productos/:codigo -> modificacion
router.put('/:codigo', async (req, res) => {
  const producto = await buscarPorCodigo(req, res);
  if (!producto) return;
  await producto.update(leerDatos(req.body));
  res.json(producto);
});

// DELETE /api/productos/:codigo -> baja
router.delete('/:codigo', async (req, res) => {
  const producto = await buscarPorCodigo(req, res);
  if (!producto) return;
  await producto.destroy();
  res.status(204).end();
});

module.exports = router;
