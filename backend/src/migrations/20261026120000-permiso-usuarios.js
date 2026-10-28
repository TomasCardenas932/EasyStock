'use strict';

// Pantalla de administracion de usuarios: se abre desde el menu del usuario y
// sus rutas (/api/usuarios, /api/roles y /api/permisos) piden este permiso.
const PERMISO = 'Usuarios';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Se le asigna al rol admin, que tiene todos los permisos. En una base nueva
  // el rol todavia no existe: lo crea despues el seeder admin-inicial, que le
  // asigna todos los permisos cargados, este incluido.
  async up(queryInterface) {
    const now = new Date();
    const fechas = { created_at: now, updated_at: now };

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert('permisos', [{ nombre: PERMISO, ...fechas }], {
        transaction,
      });

      const [[permiso]] = await queryInterface.sequelize.query(
        'SELECT id FROM permisos WHERE nombre = ?;',
        { replacements: [PERMISO], transaction }
      );
      const [roles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE nombre = 'admin';",
        { transaction }
      );

      if (roles.length > 0) {
        await queryInterface.bulkInsert(
          'rol_permisos',
          roles.map((rol) => ({ rol_id: rol.id, permiso_id: permiso.id, ...fechas })),
          { transaction }
        );
      }
    });
  },

  // La clave foranea de rol_permisos (ON DELETE CASCADE) se lo quita a los
  // roles que lo tenian.
  async down(queryInterface) {
    await queryInterface.bulkDelete('permisos', { nombre: PERMISO });
  },
};
