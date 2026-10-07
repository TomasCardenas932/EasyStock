'use strict';

const INDICE_UNICO = 'proveedores_nombre_unico';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Un proveedor se identifica por su nombre: no puede haber dos cargados con
  // el mismo, o el catalogo de articulos queda repartido entre duplicados.
  async up(queryInterface) {
    await queryInterface.addIndex('proveedores', {
      fields: ['nombre'],
      unique: true,
      name: INDICE_UNICO,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('proveedores', INDICE_UNICO);
  },
};
