'use strict';

const { Router } = require('express');
const { Proveedor } = require('../../models');

const router = Router();

// GET /api/proveedores -> lista para los selectores del ABM de articulos
router.get('/', async (req, res) => {
  const proveedores = await Proveedor.findAll({
    attributes: ['id', 'nombre'],
    order: [['nombre', 'ASC']],
  });

  res.json(proveedores);
});

module.exports = router;
