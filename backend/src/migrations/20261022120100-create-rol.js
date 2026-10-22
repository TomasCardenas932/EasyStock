'use strict';

const INDICE_UNICO = 'roles_nombre_unico';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Roles que se le asignan a los usuarios. Un rol se identifica por su
  // nombre: no puede haber dos con el mismo.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
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

    await queryInterface.addIndex('roles', {
      fields: ['nombre'],
      unique: true,
      name: INDICE_UNICO,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
