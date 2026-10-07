'use strict';

const { Router } = require('express');

const {
  obtenerProductos,
  obtenerProdCodigo,
  crearProducto,
  modificarProducto,
  bajaProducto,
} = require('../controllers/productosController');

const router = Router();

// GET /api/productos?buscar=texto -> lista de articulos, filtrada por codigo o nombre
router.get('/', obtenerProductos);

// GET /api/productos/:codigo -> un articulo
router.get('/:codigo', obtenerProdCodigo);

// POST /api/productos -> alta
router.post('/', crearProducto);

// PUT /api/productos/:codigo -> modificacion
router.put('/:codigo', modificarProducto);

// DELETE /api/productos/:codigo -> baja
router.delete('/:codigo', bajaProducto);

module.exports = router;
