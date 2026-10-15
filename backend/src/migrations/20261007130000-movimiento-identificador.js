'use strict';

const INDICE_UNICO = 'movimientos_identificador_unico';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Identificador de cada movimiento: el tipo, "#" y el numero que le toca
  // dentro de ese tipo (alta#1, alta#2, venta#1...).
  //
  // SQLite no deja agregar una columna NOT NULL sin valor por defecto, y
  // changeColumn rearma la tabla sin el AUTOINCREMENT del id. Por eso la tabla
  // se rearma aca a mano, con la columna nueva ya completa.
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_nueva', {
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
      identificador: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // Los movimientos ya cargados se numeran por tipo en el orden en que se
    // guardaron.
    await queryInterface.sequelize.query(`
      INSERT INTO movimientos_nueva (id, fecha, tipo, entidad, detalle, identificador)
      SELECT id, fecha, tipo, entidad, detalle, (
        SELECT movimiento.tipo || '#' || COUNT(*) FROM movimientos AS anterior
        WHERE anterior.tipo = movimiento.tipo AND anterior.id <= movimiento.id
      )
      FROM movimientos AS movimiento;
    `);

    await queryInterface.dropTable('movimientos');
    await queryInterface.renameTable('movimientos_nueva', 'movimientos');

    await queryInterface.addIndex('movimientos', ['identificador'], {
      name: INDICE_UNICO,
      unique: true,
    });
  },

  // DROP COLUMN no acepta columnas indexadas: primero se quita el indice.
  async down(queryInterface) {
    await queryInterface.removeIndex('movimientos', INDICE_UNICO);
    await queryInterface.sequelize.query('ALTER TABLE movimientos DROP COLUMN identificador;');
  },
};
