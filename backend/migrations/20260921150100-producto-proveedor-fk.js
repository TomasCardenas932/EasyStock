'use strict';

const INDICE_UNICO = 'productos_codigo_proveedor';

const COMUNES = ['id', 'codigo', 'nombre', 'stock', 'costo', 'precio_publico', 'created_at', 'updated_at'];

function definicion(Sequelize, { columnaProveedor, conClaveForanea }) {
  return {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    costo: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    precio_publico: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    [columnaProveedor]: {
      type: Sequelize.INTEGER,
      allowNull: true,
      // RESTRICT: un proveedor con articulos cargados no se puede dar de baja
      // sin resolver antes que pasa con esos articulos.
      ...(conClaveForanea
        ? {
            references: { model: 'proveedores', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          }
        : {}),
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  };
}

// SQLite no permite agregar una clave foranea con ALTER TABLE: la tabla se
// reconstruye copiando las filas a una tabla nueva.
async function reconstruirTabla(queryInterface, columnas, { origen, destino, indices }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('productos_tmp', columnas, { transaction });

    const columnasDestino = [...COMUNES, destino].join(', ');
    const columnasOrigen = [...COMUNES, origen].join(', ');
    await queryInterface.sequelize.query(
      `INSERT INTO productos_tmp (${columnasDestino}) SELECT ${columnasOrigen} FROM productos;`,
      { transaction }
    );

    await queryInterface.dropTable('productos', { transaction });
    await queryInterface.renameTable('productos_tmp', 'productos', { transaction });

    // addIndex descarta el tercer argumento cuando el segundo no es un array:
    // la transaccion viaja dentro del mismo objeto de opciones.
    for (const indice of indices) {
      await queryInterface.addIndex('productos', { ...indice, transaction });
    }
  });
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // `proveedor` guardaba un numero suelto, sin garantia de que ese proveedor
  // existiera. Pasa a llamarse `proveedor_id` y a ser clave foranea real
  // contra `proveedores`.
  async up(queryInterface, Sequelize) {
    // Las filas que apuntan a un proveedor inexistente romperian la clave
    // foranea al copiarlas: se les borra la referencia invalida.
    const CONDICION = 'proveedor IS NOT NULL AND proveedor NOT IN (SELECT id FROM proveedores)';

    const [conteo] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS total FROM productos WHERE ${CONDICION};`
    );
    const huerfanas = Number(conteo[0].total);

    if (huerfanas > 0) {
      await queryInterface.sequelize.query(
        `UPDATE productos SET proveedor = NULL WHERE ${CONDICION};`
      );
      console.log(
        `  > ${huerfanas} producto(s) apuntaban a un proveedor inexistente: quedaron sin proveedor.`
      );
    }

    await reconstruirTabla(
      queryInterface,
      definicion(Sequelize, { columnaProveedor: 'proveedor_id', conClaveForanea: true }),
      {
        origen: 'proveedor',
        destino: 'proveedor_id',
        indices: [{ fields: ['codigo', 'proveedor_id'], unique: true, name: INDICE_UNICO }],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await reconstruirTabla(
      queryInterface,
      definicion(Sequelize, { columnaProveedor: 'proveedor', conClaveForanea: false }),
      {
        origen: 'proveedor_id',
        destino: 'proveedor',
        indices: [{ fields: ['codigo', 'proveedor'], unique: true, name: INDICE_UNICO }],
      }
    );
  },
};
