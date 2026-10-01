'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Cada venta guarda sus articulos como una lista (JSON) con una copia de
  // codigo, nombre, precio y cantidad al momento de venderlos: si despues
  // cambia el precio del producto, la venta registrada no se altera.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      articulos: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ventas');
  },
};
