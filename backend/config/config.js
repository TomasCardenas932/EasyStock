'use strict';

const path = require('path');

const storage = (file) => path.join(__dirname, '..', 'database', file);

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: storage('easystock.dev.sqlite'),
    seederStorage: 'sequelize',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: storage('easystock.sqlite'),
    seederStorage: 'sequelize',
    logging: false,
  },
};
