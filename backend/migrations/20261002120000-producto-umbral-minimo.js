'use strict';

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
  // (codigo, proveedor_id). DROP COLUMN (SQLite 3.35+) quita solo la columna.
  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE productos DROP COLUMN umbral_minimo;');
  },
};
