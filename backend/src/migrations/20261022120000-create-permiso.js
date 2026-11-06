'use strict';

const INDICE_UNICO = 'permisos_nombre_unico';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Acciones del sistema que se le habilitan a un rol. Un permiso se
  // identifica por su nombre: no puede haber dos con el mismo.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permisos', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('permisos', {
      fields: ['nombre'],
      unique: true,
      name: INDICE_UNICO,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('permisos');
  },
};
