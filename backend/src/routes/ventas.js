'use strict';

const { Router } = require('express');
const { Producto, Venta } = require('../../models');

const router = Router();

// POST /api/ventas -> registra una venta.
// Body: { articulos: [{ productoId, cantidad }] }. Codigo, nombre y precio se
// toman de la base y no del cliente: el precio cobrado es el vigente al momento
// de registrar la venta, y el total se calcula aca.
router.post('/', async (req, res) => {
  const pedidos = Array.isArray(req.body?.articulos) ? req.body.articulos : [];
  if (pedidos.length === 0) {
    return res.status(400).json({ error: 'La venta tiene que tener al menos un articulo' });
  }

  const ids = pedidos.map((pedido) => pedido?.productoId).filter(Number.isInteger);
  const productos = await Producto.findAll({ where: { id: ids } });
  const porId = new Map(productos.map((producto) => [producto.id, producto]));

  const articulos = [];
  for (const pedido of pedidos) {
    const producto = porId.get(pedido?.productoId);
    if (!producto) {
      return res.status(404).json({ error: 'Uno de los articulos de la venta ya no existe' });
    }
    if (producto.precioPublico == null) {
      return res.status(400).json({
        error: `El articulo ${producto.codigo} no tiene precio al publico: asignale uno antes de venderlo`,
      });
    }
    if (!Number.isInteger(pedido.cantidad) || pedido.cantidad < 1) {
      return res.status(400).json({
        error: `La cantidad de ${producto.codigo} debe ser un numero entero mayor a 0`,
      });
    }

    articulos.push({
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioPublico,
      cantidad: pedido.cantidad,
    });
  }

  const total = articulos.reduce((suma, articulo) => suma + articulo.precio * articulo.cantidad, 0);
  const venta = await Venta.create({ articulos, total });
  res.status(201).json(venta);
});

module.exports = router;
