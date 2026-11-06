'use strict';

const { leerFilas } = require('../utils/tablas');

const INDICE_UNICO = 'productos_codigo_sin_proveedor';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El indice unico (codigo, proveedor_id) no frena dos productos con el mismo
  // codigo y sin proveedor: SQLite toma cada NULL como distinto. Este indice
  // parcial cubre ese caso: entre los productos sin proveedor, el codigo no se
  // repite.
  async up(queryInterface) {
    const sinProveedor = await leerFilas(queryInterface, 'productos', {
      where: { proveedor_id: null },
      attributes: ['codigo'],
    });
    const codigosVistos = new Set();
    const repetidos = new Set();
    for (const { codigo } of sinProveedor) {
      (codigosVistos.has(codigo) ? repetidos : codigosVistos).add(codigo);
    }

    // No hay forma segura de elegir cual conservar: se frena la migracion
    // para que se corrijan a mano.
    if (repetidos.size > 0) {
      const codigos = [...repetidos].join(', ');
      throw new Error(
        `Hay productos sin proveedor con el codigo repetido (${codigos}). ` +
          'Asignales un proveedor o cambiales el codigo y volve a migrar.'
      );
    }

    await queryInterface.addIndex('productos', {
      fields: ['codigo'],
      unique: true,
      name: INDICE_UNICO,
      where: { proveedor_id: null },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('productos', INDICE_UNICO);
  },
};
