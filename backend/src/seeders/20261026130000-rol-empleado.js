'use strict';

const { DASHBOARD, VENTAS } = require('../config/permisos');
const { leerFilas } = require('../utils/tablas');

// Rol para el personal de mostrador: solo ve el Dashboard y Ventas.
const ROL = 'empleado';
const PERMISOS = [DASHBOARD, VENTAS];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Corre despues de admin-inicial, que carga los permisos.
  async up(queryInterface) {
    const now = new Date();
    const fechas = { created_at: now, updated_at: now };

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert('roles', [{ nombre: ROL, ...fechas }], { transaction });

      const [rol] = await leerFilas(queryInterface, 'roles', {
        where: { nombre: ROL },
        attributes: ['id'],
        transaction,
      });
      const permisos = await leerFilas(queryInterface, 'permisos', {
        where: { nombre: PERMISOS },
        attributes: ['id'],
        transaction,
      });

      await queryInterface.bulkInsert(
        'rol_permisos',
        permisos.map((permiso) => ({ rol_id: rol.id, permiso_id: permiso.id, ...fechas })),
        { transaction }
      );
    });
  },

  // Sus filas de rol_permisos se borran solas (ON DELETE CASCADE). Si algun
  // usuario todavia tiene el rol, la clave foranea (ON DELETE RESTRICT) frena
  // la baja: hay que cambiarle el rol antes.
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { nombre: ROL });
  },
};
