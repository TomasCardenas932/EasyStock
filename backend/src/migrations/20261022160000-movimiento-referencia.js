'use strict';

const { reconstruirTabla } = require('../utils/tablas');

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

  // La tabla se rearma sin la columna (removeColumn pierde el AUTOINCREMENT
  // del id), con el indice del identificador.
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((transaction) =>
      reconstruirTabla(
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
        },
        {
          indices: [{ fields: ['identificador'], unique: true, name: 'movimientos_identificador_unico' }],
          transaction,
        }
      )
    );
  },
};
