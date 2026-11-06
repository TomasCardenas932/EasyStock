'use strict';

const { leerFilas, reconstruirTabla } = require('../utils/tablas');

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
    const movimientos = await leerFilas(queryInterface, 'movimientos', { order: [['id', 'ASC']] });
    const cantidadPorTipo = new Map();
    const numerados = movimientos.map((movimiento) => {
      const numero = (cantidadPorTipo.get(movimiento.tipo) ?? 0) + 1;
      cantidadPorTipo.set(movimiento.tipo, numero);
      return { ...movimiento, identificador: `${movimiento.tipo}#${numero}` };
    });
    if (numerados.length > 0) {
      await queryInterface.bulkInsert('movimientos_nueva', numerados);
    }

    await queryInterface.dropTable('movimientos');
    await queryInterface.renameTable('movimientos_nueva', 'movimientos');

    await queryInterface.addIndex('movimientos', ['identificador'], {
      name: INDICE_UNICO,
      unique: true,
    });
  },

  // La tabla se rearma sin la columna, como la dejaba create-movimiento: el
  // indice del identificador se va con la tabla original.
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
        },
        { transaction }
      )
    );
  },
};
