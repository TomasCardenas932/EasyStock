'use strict';

const CANTIDAD_EN_DETALLE = / x(\d+)$/;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Unidades de stock que sumo (positivo) o resto (negativo) cada movimiento.
  // Queda vacio si el movimiento no cambio el stock de ningun articulo.
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'movimientos',
        'cantidad',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );

      // Hasta ahora la cantidad vendida iba al final del detalle ("... x2"):
      // pasa a la columna nueva, en negativo, y se quita del detalle. Las
      // altas y bajas ya cargadas quedan vacias: no se sabe que stock tenian.
      const [ventas] = await queryInterface.sequelize.query(
        "SELECT id, detalle FROM movimientos WHERE tipo = 'venta'",
        { transaction }
      );
      for (const { id, detalle } of ventas) {
        const coincidencia = detalle.match(CANTIDAD_EN_DETALLE);
        if (!coincidencia) continue;
        await queryInterface.sequelize.query(
          'UPDATE movimientos SET cantidad = :cantidad, detalle = :detalle WHERE id = :id',
          {
            replacements: {
              id,
              cantidad: -Number(coincidencia[1]),
              detalle: detalle.replace(CANTIDAD_EN_DETALLE, ''),
            },
            transaction,
          }
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        "UPDATE movimientos SET detalle = detalle || ' x' || (-cantidad) WHERE tipo = 'venta' AND cantidad IS NOT NULL",
        { transaction }
      );
      await queryInterface.sequelize.query('ALTER TABLE movimientos DROP COLUMN cantidad;', {
        transaction,
      });
    });
  },
};
