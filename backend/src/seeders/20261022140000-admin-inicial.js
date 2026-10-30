'use strict';

const { randomBytes } = require('crypto');
const { hashear } = require('../utils/contrasenas');
const { leerFilas } = require('../utils/tablas');

// Un permiso por cada pantalla de la barra lateral, con el mismo nombre.
const PERMISOS = Object.values(require('../config/permisos'));

const ROL = 'admin';

// Usuario para el primer ingreso al sistema. El repositorio es publico: el
// email y el telefono son de ejemplo, y se cambian desde la pantalla de
// Usuarios.
const USUARIO = {
  nombre: 'Tomas',
  apellido: 'Cardenas',
  email: 'tomas.cardenas@example.com',
  telefono: '11 12345678',
};

// La contrasena tampoco esta en el codigo: sale de la variable de entorno
// ADMIN_CONTRASENA o, sin ella, se genera al azar y se muestra una sola vez en
// la consola al correr el seeder.
function contrasenaInicial() {
  if (process.env.ADMIN_CONTRASENA) return process.env.ADMIN_CONTRASENA;

  const contrasena = randomBytes(9).toString('base64url');
  console.log(`  > Contrasena de ${USUARIO.email}: ${contrasena} (cambiala desde Usuarios)`);
  return contrasena;
}

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
      const existentes = await leerFilas(queryInterface, 'permisos', {
        attributes: ['nombre'],
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

      const [rol] = await leerFilas(queryInterface, 'roles', {
        where: { nombre: ROL },
        attributes: ['id'],
        transaction,
      });
      const permisos = await leerFilas(queryInterface, 'permisos', { attributes: ['id'], transaction });

      await queryInterface.bulkInsert(
        'rol_permisos',
        permisos.map((permiso) => ({ rol_id: rol.id, permiso_id: permiso.id, ...fechas })),
        { transaction }
      );
      await queryInterface.bulkInsert(
        'usuarios',
        [{ ...USUARIO, contrasena: await hashear(contrasenaInicial()), rol_id: rol.id, ...fechas }],
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
