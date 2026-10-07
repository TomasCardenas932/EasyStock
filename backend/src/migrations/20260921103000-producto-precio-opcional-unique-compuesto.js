'use strict';

const COLUMNAS = [
  'id',
  'codigo',
  'nombre',
  'stock',
  'costo',
  'precio_publico',
  'proveedor',
  'created_at',
  'updated_at',
];

const INDICE_UNICO = 'productos_codigo_proveedor';

function definicion(Sequelize, { precioPublicoObligatorio, codigoUnico }) {
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
      unique: codigoUnico,
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
      allowNull: !precioPublicoObligatorio,
    },
    proveedor: {
      type: Sequelize.INTEGER,
      allowNull: true,
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

// SQLite no permite quitar el UNIQUE de una columna ni cambiar su nulabilidad
// con ALTER TABLE. La tabla se reconstruye: se crea con la definicion nueva,
// se copian las filas y se reemplaza a la original.
async function reconstruirTabla(queryInterface, columnas, indices) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('productos_tmp', columnas, { transaction });

    const lista = COLUMNAS.join(', ');
    await queryInterface.sequelize.query(
      `INSERT INTO productos_tmp (${lista}) SELECT ${lista} FROM productos;`,
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

async function contar(queryInterface, sql) {
  const [filas] = await queryInterface.sequelize.query(sql);
  return Number(filas[0].total);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El precio al publico pasa a ser opcional: al importar un catalogo de
  // proveedor se cargan el codigo y el costo, y el precio se asigna despues
  // (BRD v1.2, regla 2).
  //
  // El codigo deja de ser unico en toda la tabla y pasa a serlo por proveedor:
  // cada proveedor tiene su propia codificacion (BRD v1.2, regla 8).
  async up(queryInterface, Sequelize) {
    await reconstruirTabla(
      queryInterface,
      definicion(Sequelize, { precioPublicoObligatorio: false, codigoUnico: false }),
      [{ fields: ['codigo', 'proveedor'], unique: true, name: INDICE_UNICO }]
    );
  },

  async down(queryInterface, Sequelize) {
    const sinPrecio = await contar(
      queryInterface,
      'SELECT COUNT(*) AS total FROM productos WHERE precio_publico IS NULL;'
    );
    if (sinPrecio > 0) {
      throw new Error(
        `No se puede revertir: hay ${sinPrecio} producto(s) sin precio al publico. ` +
          'Asignales un precio antes de volver a la version anterior.'
      );
    }

    const repetidos = await contar(
      queryInterface,
      'SELECT COUNT(*) AS total FROM (SELECT codigo FROM productos GROUP BY codigo HAVING COUNT(*) > 1);'
    );
    if (repetidos > 0) {
      throw new Error(
        `No se puede revertir: hay ${repetidos} codigo(s) repetidos entre proveedores. ` +
          'La version anterior exige que el codigo sea unico en toda la tabla.'
      );
    }

    await reconstruirTabla(
      queryInterface,
      definicion(Sequelize, { precioPublicoObligatorio: true, codigoUnico: true }),
      []
    );
  },
};
