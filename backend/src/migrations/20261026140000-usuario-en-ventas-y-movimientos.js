'use strict';

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

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const tabla of TABLAS) {
        for (const columna of ['usuario_id', 'usuario_nombre']) {
          await queryInterface.sequelize.query(`ALTER TABLE ${tabla} DROP COLUMN ${columna};`, {
            transaction,
          });
        }
      }
    });
  },
};
