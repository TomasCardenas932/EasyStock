'use strict';

const { Op } = require('sequelize');
const { leerFilas, reconstruirTabla } = require('../utils/tablas');

const CANTIDAD_EN_DETALLE = / x(\d+)$/;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Unidades de stock que sumo (positivo) o resto (negativo) cada movimiento.
  // Queda vacio si el movimiento no cambio el stock de ningun articulo.
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'movimientos',
        'cantidad',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );

      // Hasta ahora la cantidad vendida iba al final del detalle ("... x2"):
      // pasa a la columna nueva, en negativo, y se quita del detalle. Las
      // altas y bajas ya cargadas quedan vacias: no se sabe que stock tenian.
      const ventas = await leerFilas(queryInterface, 'movimientos', {
        where: { tipo: 'venta' },
        attributes: ['id', 'detalle'],
        transaction,
      });
      for (const { id, detalle } of ventas) {
        const coincidencia = detalle.match(CANTIDAD_EN_DETALLE);
        if (!coincidencia) continue;
        await queryInterface.bulkUpdate(
          'movimientos',
          { cantidad: -Number(coincidencia[1]), detalle: detalle.replace(CANTIDAD_EN_DETALLE, '') },
          { id },
          { transaction }
        );
      }
    });
  },

  // La cantidad de las ventas vuelve al final del detalle y la tabla se rearma
  // sin la columna, con el indice del identificador.
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const ventas = await leerFilas(queryInterface, 'movimientos', {
        where: { tipo: 'venta', cantidad: { [Op.ne]: null } },
        attributes: ['id', 'detalle', 'cantidad'],
        transaction,
      });
      for (const { id, detalle, cantidad } of ventas) {
        await queryInterface.bulkUpdate(
          'movimientos',
          { detalle: `${detalle} x${-cantidad}` },
          { id },
          { transaction }
        );
      }

      await reconstruirTabla(
        queryInterface,
        'movimientos',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
          fecha: { type: Sequelize.DATE, allowNull: false },
          tipo: { type: Sequelize.STRING, allowNull: false },
          entidad: { type: Sequelize.STRING, allowNull: false },
          detalle: { type: Sequelize.STRING, allowNull: false },
          identificador: { type: Sequelize.STRING, allowNull: false },
        },
        {
          indices: [{ fields: ['identificador'], unique: true, name: 'movimientos_identificador_unico' }],
          transaction,
        }
      );
    });
  },
};
