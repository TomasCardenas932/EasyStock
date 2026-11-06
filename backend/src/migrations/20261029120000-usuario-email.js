'use strict';

const { reconstruirTabla } = require('../utils/tablas');

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

  // La tabla se rearma sin la columna, como la dejaba create-usuario: el indice
  // del email se va con la tabla original. removeColumn perderia el
  // AUTOINCREMENT del id y el ON DELETE de la clave foranea del rol. Ninguna
  // tabla apunta a usuarios con una clave foranea (ventas y movimientos
  // guardan el usuario_id suelto), asi que borrarla no afecta a otras.
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((transaction) =>
      reconstruirTabla(
        queryInterface,
        'usuarios',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
          nombre: { type: Sequelize.STRING, allowNull: false },
          apellido: { type: Sequelize.STRING, allowNull: false },
          telefono: { type: Sequelize.STRING, allowNull: false },
          contrasena: { type: Sequelize.STRING, allowNull: false },
          rol_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'roles', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          created_at: { type: Sequelize.DATE, allowNull: false },
          updated_at: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      )
    );
  },
};
