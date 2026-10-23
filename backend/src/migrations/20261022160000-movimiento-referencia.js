'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Factura o remito con el que se recibio la mercaderia de una entrada de
  // stock (FRD, AR-2). Es opcional y los demas movimientos la dejan vacia.
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movimientos', 'referencia', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE movimientos DROP COLUMN referencia;');
  },
};
