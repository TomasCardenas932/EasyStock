'use strict';

// Pantallas que el FRD v1.1 saco del alcance: SC005 (las alertas de
// reposicion pasan al Dashboard) y SC006 (informes de caja).
const QUITADOS = ['Alertas', 'Informes'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El seeder admin-inicial ya no los crea; aca se borran de las bases donde
  // ya se habia corrido. La clave foranea de rol_permisos (ON DELETE CASCADE)
  // se los quita a los roles que los tenian.
  async up(queryInterface) {
    await queryInterface.bulkDelete('permisos', { nombre: QUITADOS });
  },

  // Vuelven a existir y se le asignan al rol admin, como los dejaba el
  // seeder. Los demas roles que los tenian no se pueden saber.
  async down(queryInterface) {
    const now = new Date();
    const fechas = { created_at: now, updated_at: now };

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'permisos',
        QUITADOS.map((nombre) => ({ nombre, ...fechas })),
        { transaction }
      );

      const [roles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE nombre = 'admin';",
        { transaction }
      );
      const [permisos] = await queryInterface.sequelize.query(
        'SELECT id FROM permisos WHERE nombre IN (?);',
        { replacements: [QUITADOS], transaction }
      );

      const asignaciones = roles.flatMap((rol) =>
        permisos.map((permiso) => ({ rol_id: rol.id, permiso_id: permiso.id, ...fechas }))
      );
      if (asignaciones.length > 0) {
        await queryInterface.bulkInsert('rol_permisos', asignaciones, { transaction });
      }
    });
  },
};
