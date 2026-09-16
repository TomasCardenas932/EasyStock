'use strict';

const { Router } = require('express');
const { Producto } = require('../../models');

const router = Router();

// GET /api/productos -> lista completa de articulos
router.get('/', async (req, res, next) => {
  try {
    const productos = await Producto.findAll({ order: [['nombre', 'ASC']] });
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
