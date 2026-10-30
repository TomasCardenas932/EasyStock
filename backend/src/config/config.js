'use strict';

const path = require('path');

const storage = (file) => path.join(__dirname, '..', 'database', file);

// Las transacciones toman el lock de escritura de SQLite al empezar
// (IMMEDIATE): si dos operaciones escriben a la vez, la segunda espera a que
// termine la primera. Con el modo por defecto (DEFERRED) dos ventas podian
// leer el mismo stock, y dos movimientos el mismo numero de identificador.
const transactionType = 'IMMEDIATE';

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: storage('easystock.dev.sqlite'),
    seederStorage: 'sequelize',
    logging: false,
    transactionType,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    transactionType,
  },
  production: {
    dialect: 'sqlite',
    storage: storage('easystock.sqlite'),
    seederStorage: 'sequelize',
    logging: false,
    transactionType,
  },
};
