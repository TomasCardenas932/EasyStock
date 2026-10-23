const { literal } = require('sequelize');
const { sequelize, Movimiento } = require('../models');

const FILTRO_BUSQUEDA =
  "(substr(`identificador`, instr(`identificador`, '#')) = :texto" +
  " OR strftime('%d/%m/%Y', `fecha`, 'localtime') LIKE :texto || '%')";

// El id desempata movimientos guardados en el mismo instante (los articulos de
// una misma venta).
const obtenerMovimientos = async (req, res) => {
  const movimientos = await Movimiento.findAll({
    where: literal(FILTRO_BUSQUEDA),
    replacements: { texto: req.query.buscar },
    order: [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  res.json(movimientos);
};

// FRD, regla 7: la entrada suma la cantidad al stock del articulo y queda en
// Movimientos (CA-2). Las dos cosas van juntas: si falla una, no queda
// ninguna. increment no corre los hooks de Producto, asi que no se registra
// ademas una modificacion. Responde con el stock que quedo, para que la
// pantalla muestre de cuanto a cuanto paso.
const registrarEntrada = async (req, res) => {
  const { producto } = req;
  const { cantidad, referencia } = req.body;

  const movimiento = await sequelize.transaction(async (transaction) => {
    await producto.increment('stock', { by: cantidad, transaction });
    await producto.reload({ transaction });
    return Movimiento.registrar(
      {
        tipo: 'entrada',
        entidad: 'producto',
        detalle: `${producto.codigo} - ${producto.nombre}`,
        cantidad,
        referencia,
      },
      { transaction }
    );
  });

  res.status(201).json({ movimiento, producto });
};

module.exports = {
  obtenerMovimientos,
  registrarEntrada,
};
