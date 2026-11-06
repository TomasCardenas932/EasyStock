'use strict';

const { reconstruirTabla } = require('../utils/tablas');

const TABLAS = ['ventas', 'movimientos'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Usuario que hizo la venta o la operacion (BRD, CB-07 y AR-10). El nombre
  // y apellido se copian al momento de la operacion, como el precio de una
  // venta: siguen a la vista aunque despues el usuario cambie o se de de
  // baja. Por eso usuario_id no lleva clave foranea. Los registros
  // anteriores quedan vacios.
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const tabla of TABLAS) {
        await queryInterface.addColumn(
          tabla,
          'usuario_id',
          { type: Sequelize.INTEGER, allowNull: true },
          { transaction }
        );
        await queryInterface.addColumn(
          tabla,
          'usuario_nombre',
          { type: Sequelize.STRING, allowNull: true },
          { transaction }
        );
      }
    });
  },

  // Las tablas se rearman sin las dos columnas (removeColumn pierde el
  // AUTOINCREMENT del id), como estaban antes de esta migracion.
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await reconstruirTabla(
        queryInterface,
        'ventas',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
          articulos: { type: Sequelize.JSON, allowNull: false },
          fecha: { type: Sequelize.DATE, allowNull: false },
          total: { type: Sequelize.INTEGER, allowNull: false },
        },
        { transaction }
      );
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
          cantidad: { type: Sequelize.INTEGER, allowNull: true },
          referencia: { type: Sequelize.STRING, allowNull: true },
        },
        {
          indices: [{ fields: ['identificador'], unique: true, name: 'movimientos_identificador_unico' }],
          transaction,
        }
      );
    });
  },
};
