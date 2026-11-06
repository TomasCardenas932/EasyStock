'use strict';

const { reconstruirTabla } = require('../utils/tablas');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Umbral minimo de stock por articulo: con el stock en ese valor o por debajo,
  // el articulo tiene que reponerse (BRD v1.3, AR-8 y regla 1). Es opcional: un
  // articulo sin umbral no genera avisos de reposicion.
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('productos', 'umbral_minimo', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  // removeColumn en SQLite reconstruye la tabla y no conserva el indice unico
  // (codigo, proveedor_id) ni el ON DELETE de la clave foranea: la tabla se
  // rearma con la definicion que tenia antes de esta migracion.
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((transaction) =>
      reconstruirTabla(
        queryInterface,
        'productos',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
          codigo: { type: Sequelize.STRING, allowNull: false },
          nombre: { type: Sequelize.STRING, allowNull: false },
          stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          costo: { type: Sequelize.INTEGER, allowNull: false },
          precio_publico: { type: Sequelize.INTEGER, allowNull: true },
          proveedor_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'proveedores', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          created_at: { type: Sequelize.DATE, allowNull: false },
          updated_at: { type: Sequelize.DATE, allowNull: false },
        },
        {
          indices: [{ fields: ['codigo', 'proveedor_id'], unique: true, name: 'productos_codigo_proveedor' }],
          transaction,
        }
      )
    );
  },
};
