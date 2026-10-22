'use strict';

const INDICE_UNICO = 'productos_codigo_sin_proveedor';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El indice unico (codigo, proveedor_id) no frena dos productos con el mismo
  // codigo y sin proveedor: SQLite toma cada NULL como distinto. Este indice
  // parcial cubre ese caso: entre los productos sin proveedor, el codigo no se
  // repite.
  async up(queryInterface) {
    const [repetidos] = await queryInterface.sequelize.query(
      'SELECT codigo FROM productos WHERE proveedor_id IS NULL GROUP BY codigo HAVING COUNT(*) > 1;'
    );

    // No hay forma segura de elegir cual conservar: se frena la migracion
    // para que se corrijan a mano.
    if (repetidos.length > 0) {
      const codigos = repetidos.map((fila) => fila.codigo).join(', ');
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
