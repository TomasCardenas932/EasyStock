'use strict';

const PRODUCTOS = [
  { codigo: 'FIL-0001', nombre: 'Filtro de aceite Honda CG 150', stock: 24, costo: 3200, precio_publico: 5500, proveedor: 1 },
  { codigo: 'KIT-0001', nombre: 'Kit de transmision Yamaha YBR 125', stock: 6, costo: 28000, precio_publico: 42000, proveedor: 2 },
  { codigo: 'PAS-0001', nombre: 'Pastillas de freno delanteras Bajaj Rouser 200', stock: 15, costo: 6500, precio_publico: 11000, proveedor: 1 },
  { codigo: 'LUB-0001', nombre: 'Aceite 4T 10W40 1L', stock: 40, costo: 7800, precio_publico: 12500, proveedor: 3 },
  { codigo: 'CUB-0001', nombre: 'Cubierta trasera 90/90-18', stock: 3, costo: 35000, precio_publico: 54000, proveedor: 2 },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'productos',
      PRODUCTOS.map((p) => ({ ...p, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', {
      codigo: { [Sequelize.Op.in]: PRODUCTOS.map((p) => p.codigo) },
    });
  },
};
