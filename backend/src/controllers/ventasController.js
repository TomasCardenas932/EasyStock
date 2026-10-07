const { sequelize, Venta } = require('../models');

// Las verificaciones corren antes, en middlewares/ventasMiddleware.js:
// req.venta trae las lineas con los datos de la base y las unidades a
// descontar de cada producto, ya chequeadas contra el stock.
const registrarVenta = async (req, res) => {
  const { articulos, unidades } = req.venta;

  // Descuento de stock y alta de la venta van juntos: si algo falla en el
  // medio, no queda stock descontado sin venta ni venta sin descontar.
  const venta = await sequelize.transaction(async (transaction) => {
    // BRD v1.2, regla 6: al confirmar la venta se descuentan las unidades.
    for (const [producto, cantidad] of unidades) {
      await producto.decrement('stock', { by: cantidad, transaction });
    }

    const total = articulos.reduce(
      (suma, articulo) => suma + articulo.precio * articulo.cantidad,
      0
    );
    return Venta.create({ articulos, total }, { transaction });
  });

  res.status(201).json(venta);
};

module.exports = {
  registrarVenta,
};
