'use strict';

const app = require('./app');
const { sequelize } = require('../models');

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`API EasyStock escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  }
})();
