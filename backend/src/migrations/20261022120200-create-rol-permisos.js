'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Tabla intermedia entre roles y permisos: cada fila le asigna un permiso a
  // un rol. La clave primaria compuesta evita asignar dos veces el mismo
  // permiso al mismo rol. Al borrar un rol o un permiso se borran sus
  // asignaciones.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rol_permisos', {
      rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permiso_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'permisos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('rol_permisos');
  },
};
