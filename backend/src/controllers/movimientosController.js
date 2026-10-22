const { literal } = require('sequelize');
const { Movimiento } = require('../models');

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

module.exports = {
  obtenerMovimientos,
};
