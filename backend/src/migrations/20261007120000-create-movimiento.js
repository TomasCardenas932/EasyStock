'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Registro de las operaciones del sistema (pantalla SC004): altas, bajas y
  // modificaciones de articulos y proveedores, y cada articulo vendido. El
  // detalle es una copia en texto: el movimiento sigue legible aunque despues
  // se modifique o se borre el registro al que se refiere.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      entidad: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detalle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movimientos');
  },
};
