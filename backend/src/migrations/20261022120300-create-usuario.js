'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Personas que operan el sistema. Cada usuario puede tener un rol, que
  // define sus permisos.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
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
      apellido: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contrasena: {
        // Sal y hash scrypt, nunca el texto plano (ver el modelo Usuario).
        type: Sequelize.STRING,
        allowNull: false,
      },
      rol_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // RESTRICT: un rol con usuarios asignados no se puede dar de baja sin
        // resolver antes que rol pasan a tener esos usuarios.
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
