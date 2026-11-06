const { Producto } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaVenta } = require('../schemas/ventasSchema');

const validarVenta = validar({ body: esquemaVenta });

// Verifica contra la base que la venta se pueda registrar y deja en req.venta:
// - articulos: las lineas con codigo, nombre y precio tomados de la base.
// - unidades: cuanto descontar de cada producto, sumando las lineas repetidas.

const prepararVenta = async (req, res, next) => {
  const pedidos = req.body.articulos;
  const productos = await Producto.findAll({
    where: { id: pedidos.map((pedido) => pedido.productoId) },
  });
  const porId = new Map(productos.map((producto) => [producto.id, producto]));

  const articulos = [];
  const unidades = new Map();

  for (const { productoId, cantidad } of pedidos) {
    const producto = porId.get(productoId);
    if (!producto) {
      throw new ErrorHttp(404, 'Uno de los articulos de la venta ya no existe');
    }
    if (producto.precioPublico == null) {
      throw new ErrorHttp(
        400,
        `El articulo ${producto.codigo} no tiene precio al publico: asignale uno antes de venderlo`
      );
    }

    articulos.push({
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioPublico,
      cantidad,
    });
    unidades.set(producto, (unidades.get(producto) ?? 0) + cantidad);
  }

  // Si no alcanza el stock se bloquea la venta entera e informa la existencia
  for (const [producto, cantidad] of unidades) {
    if (producto.stock < cantidad) {
      throw new ErrorHttp(
        409,
        `No hay stock suficiente de ${producto.codigo}: se pidieron ${cantidad} y hay ${producto.stock}`
      );
    }
  }

  req.venta = { articulos, unidades };
  next();
};

module.exports = {
  validarVenta,
  prepararVenta,
};
