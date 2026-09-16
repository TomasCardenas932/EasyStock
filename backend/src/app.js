'use strict';

const express = require('express');
const productosRouter = require('./routes/productos');

const app = express();

app.use(express.json());

app.use('/api/productos', productosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
