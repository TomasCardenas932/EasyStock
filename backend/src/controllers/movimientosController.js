const { Op, fn, col, where } = require('sequelize');
const { sequelize, Movimiento } = require('../models');
const { empiezaCon } = require('../utils/busqueda');

// "#" y numero del identificador (alta#12 -> #12), para buscar por numero.
const NUMERO = fn('substr', col('identificador'), fn('instr', col('identificador'), '#'));

// Fecha en hora local, con el formato de la pantalla, para buscar por fecha o
// por su comienzo (25/10).
const FECHA = fn('strftime', '%d/%m/%Y', col('fecha'), 'localtime');

// El id desempata movimientos guardados en el mismo instante (los articulos de
// una misma venta).
const obtenerMovimientos = async (req, res) => {
  const { buscar } = req.query;
  const movimientos = await Movimiento.findAll({
    where: { [Op.or]: [where(NUMERO, buscar), empiezaCon(FECHA, buscar)] },
    order: [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  res.json(movimientos);
};

// FRD, regla 7: la entrada suma la cantidad al stock del articulo y queda en
// Movimientos (CA-2). Las dos cosas van juntas: si falla una, no queda
// ninguna, y el movimiento lleva el usuario de la sesion. increment no corre
// los hooks de Producto, asi que no se registra ademas una modificacion.
// Responde con el stock que quedo, para que la pantalla muestre de cuanto a
// cuanto paso.
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
      { transaction, autor: req.sesion.autor() }
    );
  });

  res.status(201).json({ movimiento, producto });
};

module.exports = {
  obtenerMovimientos,
  registrarEntrada,
};
