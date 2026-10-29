// Operaciones de las migraciones y los seeders sobre las tablas, hechas con el
// QueryInterface de Sequelize: no pasan por los modelos, que cambian con cada
// migracion.

// Filas de una tabla tal como estan guardadas. options: where, attributes,
// order y transaction, como en los modelos.
const leerFilas = (queryInterface, tabla, options = {}) =>
  queryInterface.select(null, tabla, { raw: true, ...options });

// Copia las filas de origen a destino. columnas: los nombres en destino;
// renombrar indica, para las que cambian de nombre, de que columna de origen
// salen ({ destino: origen }).
async function copiarFilas(queryInterface, origen, destino, columnas, { renombrar = {}, transaction } = {}) {
  const filas = await leerFilas(queryInterface, origen, {
    attributes: columnas.map((columna) => (renombrar[columna] ? [renombrar[columna], columna] : columna)),
    order: [['id', 'ASC']],
    transaction,
  });
  if (filas.length > 0) {
    await queryInterface.bulkInsert(destino, filas, { transaction });
  }
}

// Rearma una tabla con la definicion indicada: crea una tabla nueva, copia las
// filas, reemplaza a la original y vuelve a crear los indices. Sirve para
// quitar columnas en SQLite: removeColumn tambien rearma la tabla, pero pierde
// los indices de varias columnas, el AUTOINCREMENT y el ON DELETE de las
// claves foraneas. No sirve para tablas a las que apuntan claves foraneas de
// otras: al borrar la original, SQLite aplicaria su ON DELETE.
async function reconstruirTabla(queryInterface, tabla, definicion, { indices = [], transaction } = {}) {
  const temporal = `${tabla}_tmp`;
  await queryInterface.createTable(temporal, definicion, { transaction });
  await copiarFilas(queryInterface, tabla, temporal, Object.keys(definicion), { transaction });
  await queryInterface.dropTable(tabla, { transaction });
  await queryInterface.renameTable(temporal, tabla, { transaction });

  // addIndex descarta el tercer argumento cuando el segundo no es un array:
  // la transaccion viaja dentro del mismo objeto de opciones.
  for (const indice of indices) {
    await queryInterface.addIndex(tabla, { ...indice, transaction });
  }
}

module.exports = { leerFilas, copiarFilas, reconstruirTabla };
