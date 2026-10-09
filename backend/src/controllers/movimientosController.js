const { literal } = require('sequelize');
const { Movimiento } = require('../models');

// La busqueda llega validada desde middlewares/movimientosMiddleware.js: es
// '', "#numero" o una fecha (o su principio), y no trae comodines de LIKE.
//
// - El numero se compara con lo que sigue al "#" del identificador, entero:
//   "#302" no trae venta#3020.
// - La fecha se compara como la muestra la pantalla, dd/mm/aaaa en hora local
//   (la base la guarda en UTC). El servidor corre en la misma maquina que el
//   comercio, asi que su hora local es la del comercio.
//
// Cada condicion nunca coincide con el texto de la otra (las fechas no llevan
// "#" y los identificadores no llevan "/"). Sin texto, el patron de la fecha
// queda '%' y trae todos los movimientos.
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
