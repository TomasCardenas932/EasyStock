'use strict';

const { hashear } = require('../utils/contrasenas');

// Un permiso por cada pantalla de la barra lateral, con el mismo nombre.
const PERMISOS = Object.values(require('../config/permisos'));

const ROL = 'admin';

// Usuario para el primer ingreso al sistema. La contrasena es de prueba:
// cambiala antes de usar el sistema con datos reales.
const USUARIO = {
  nombre: 'Tomas',
  apellido: 'Cardenas',
  email: 'tomascardenas932@gmail.com',
  telefono: '11 61376740',
};
const CONTRASENA = '123456';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El rol admin recibe todos los permisos cargados, no solo los de este
  // seeder. Los que ya existen no se vuelven a crear: Usuarios lo carga su
  // migracion, que corre antes. La contrasena se hashea aca porque bulkInsert
  // no pasa por los hooks del modelo Usuario.
  async up(queryInterface) {
    const now = new Date();
    const fechas = { created_at: now, updated_at: now };

    await queryInterface.sequelize.transaction(async (transaction) => {
      const [existentes] = await queryInterface.sequelize.query('SELECT nombre FROM permisos;', {
        transaction,
      });
      const cargados = new Set(existentes.map((permiso) => permiso.nombre));
      const faltantes = PERMISOS.filter((nombre) => !cargados.has(nombre));
      if (faltantes.length > 0) {
        await queryInterface.bulkInsert(
          'permisos',
          faltantes.map((nombre) => ({ nombre, ...fechas })),
          { transaction }
        );
      }
      await queryInterface.bulkInsert('roles', [{ nombre: ROL, ...fechas }], { transaction });

      const [[rol]] = await queryInterface.sequelize.query('SELECT id FROM roles WHERE nombre = ?;', {
        replacements: [ROL],
        transaction,
      });
      const [permisos] = await queryInterface.sequelize.query('SELECT id FROM permisos;', {
        transaction,
      });

      await queryInterface.bulkInsert(
        'rol_permisos',
        permisos.map((permiso) => ({ rol_id: rol.id, permiso_id: permiso.id, ...fechas })),
        { transaction }
      );
      await queryInterface.bulkInsert(
        'usuarios',
        [{ ...USUARIO, contrasena: await hashear(CONTRASENA), rol_id: rol.id, ...fechas }],
        { transaction }
      );
    });
  },

  // Primero el usuario: la clave foranea (ON DELETE RESTRICT) no deja borrar
  // un rol con usuarios. Al borrar el rol y los permisos, sus filas de
  // rol_permisos se borran solas (ON DELETE CASCADE).
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        'usuarios',
        { nombre: USUARIO.nombre, apellido: USUARIO.apellido },
        { transaction }
      );
      await queryInterface.bulkDelete('roles', { nombre: ROL }, { transaction });
      await queryInterface.bulkDelete('permisos', { nombre: PERMISOS }, { transaction });
    });
  },
};
