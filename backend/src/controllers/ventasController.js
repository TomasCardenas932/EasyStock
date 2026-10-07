const { sequelize, Producto, Venta } = require('../models');

// Error que corta el registro de la venta y se responde tal cual al cliente.
// Al lanzarse dentro de la transaccion, tambien la deshace.
class ErrorVenta extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// Body: { articulos: [{ productoId, cantidad }] }. Codigo, nombre y precio se
// toman de la base y no del cliente: el precio cobrado es el vigente al momento
// de registrar la venta, y el total se calcula aca.
const registrarVenta = async (req, res) => {
  const pedidos = Array.isArray(req.body?.articulos) ? req.body.articulos : [];
  if (pedidos.length === 0) {
    return res.status(400).json({ error: 'La venta tiene que tener al menos un articulo' });
  }

  try {
    // Descuento de stock y alta de la venta van juntos: si algo falla en el
    // medio, no queda stock descontado sin venta ni venta sin descontar.
    const venta = await sequelize.transaction(async (transaction) => {
      const ids = pedidos.map((pedido) => pedido?.productoId).filter(Number.isInteger);
      const productos = await Producto.findAll({ where: { id: ids }, transaction });
      const porId = new Map(productos.map((producto) => [producto.id, producto]));

      const articulos = [];
      // Unidades pedidas por producto, por si un mismo articulo viene en mas
      // de una linea.
      const unidades = new Map();

      for (const pedido of pedidos) {
        const producto = porId.get(pedido?.productoId);
        if (!producto) {
          throw new ErrorVenta(404, 'Uno de los articulos de la venta ya no existe');
        }
        if (producto.precioPublico == null) {
          throw new ErrorVenta(
            400,
            `El articulo ${producto.codigo} no tiene precio al publico: asignale uno antes de venderlo`
          );
        }
        if (!Number.isInteger(pedido.cantidad) || pedido.cantidad < 1) {
          throw new ErrorVenta(
            400,
            `La cantidad de ${producto.codigo} debe ser un numero entero mayor a 0`
          );
        }

        articulos.push({
          productoId: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precioPublico,
          cantidad: pedido.cantidad,
        });
        unidades.set(producto.id, (unidades.get(producto.id) ?? 0) + pedido.cantidad);
      }

      // Si no alcanza el stock se bloquea la venta entera e informa la
      // existencia real (BRD v1.2, regla 5). Se revisa todo antes de descontar.
      for (const [id, cantidad] of unidades) {
        const producto = porId.get(id);
        if (producto.stock < cantidad) {
          throw new ErrorVenta(
            409,
            `No hay stock suficiente de ${producto.codigo}: se pidieron ${cantidad} y hay ${producto.stock}`
          );
        }
      }

      // BRD v1.2, regla 6: al confirmar la venta se descuentan las unidades.
      for (const [id, cantidad] of unidades) {
        await porId.get(id).decrement('stock', { by: cantidad, transaction });
      }

      const total = articulos.reduce(
        (suma, articulo) => suma + articulo.precio * articulo.cantidad,
        0
      );
      return Venta.create({ articulos, total }, { transaction });
    });

    res.status(201).json(venta);
  } catch (err) {
    if (err instanceof ErrorVenta) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

module.exports = {
  registrarVenta,
};
