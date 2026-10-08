const { Movimiento } = require('../models');

// El listado no recibe parametros, asi que no pasa por ningun middleware de
// verificacion. El id desempata movimientos guardados en el mismo instante
// (los articulos de una misma venta).
const obtenerMovimientos = async (req, res) => {
  const movimientos = await Movimiento.findAll({
    order: [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  res.json(movimientos);
};

module.exports = {
  obtenerMovimientos,
};
