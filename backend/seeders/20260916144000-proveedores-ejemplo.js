'use strict';

// Nombres de ejemplo: reemplazalos por los proveedores reales del comercio.
// Los ids son explicitos porque el seeder de productos los referencia.
const PROVEEDORES = [
  { id: 1, nombre: 'Distribuidora Moto Sur' },
  { id: 2, nombre: 'Repuestos Andes' },
  { id: 3, nombre: 'Lubricantes del Centro' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El nombre de archivo es anterior al del seeder de productos a proposito:
  // los proveedores tienen que existir antes de que los productos los
  // referencien por clave foranea.
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'proveedores',
      PROVEEDORES.map((p) => ({ ...p, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('proveedores', {
      id: { [Sequelize.Op.in]: PROVEEDORES.map((p) => p.id) },
    });
  },
};
