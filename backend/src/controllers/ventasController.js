const { sequelize, Venta } = require('../models');

// Las verificaciones corren antes, en middlewares/ventasMiddleware.js:
// req.venta trae las lineas con los datos de la base y las unidades a
// descontar de cada producto, ya chequeadas contra el stock.
const registrarVenta = async (req, res) => {
  const { articulos, unidades } = req.venta;
  // El usuario de la sesion queda en la venta y en sus movimientos.
  const autor = req.sesion.autor();

  // Descuento de stock y alta de la venta van juntos: si algo falla en el
  // medio, no queda stock descontado sin venta ni venta sin descontar.
  const venta = await sequelize.transaction(async (transaction) => {
    // BRD v1.2, regla 6: al confirmar la venta se descuentan las unidades.
    // Otra venta pudo descontar entre la verificacion del middleware y esta
    // transaccion: con el stock que quedo, el modelo rechaza un negativo y no
    // se guarda nada. decrement no valida por su cuenta.
    for (const [producto, cantidad] of unidades) {
      await producto.decrement('stock', { by: cantidad, transaction });
      await producto.reload({ transaction });
      await producto.validate({ fields: ['stock'] });
    }

    const total = articulos.reduce(
      (suma, articulo) => suma + articulo.precio * articulo.cantidad,
      0
    );
    return Venta.create(
      { articulos, total, usuarioId: autor.id, usuarioNombre: autor.nombre },
      { transaction, autor }
    );
  });

  res.status(201).json(venta);
};

module.exports = {
  registrarVenta,
};
