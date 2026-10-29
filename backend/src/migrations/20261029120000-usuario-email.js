'use strict';

const INDICE_UNICO = 'usuarios_email_unico';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El usuario inicia sesion con su email, en lugar del nombre: no puede haber
  // dos usuarios con el mismo. SQLite no agrega una columna NOT NULL sin valor
  // por defecto, asi que la columna admite NULL y el modelo Usuario exige el
  // email. Los usuarios cargados antes quedan sin email, y sin email no pueden
  // iniciar sesion hasta que se les cargue uno.
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'usuarios',
        'email',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addIndex('usuarios', {
        fields: ['email'],
        unique: true,
        name: INDICE_UNICO,
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('usuarios', INDICE_UNICO, { transaction });
      await queryInterface.sequelize.query('ALTER TABLE usuarios DROP COLUMN email;', {
        transaction,
      });
    });
  },
};
