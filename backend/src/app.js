'use strict';

const express = require('express');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const productosRouter = require('./routes/productos');

const app = express();

app.use(express.json());

app.use('/api/productos', productosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON valido' });
  }

  // UniqueConstraintError hereda de ValidationError: se evalua primero.
  if (err instanceof UniqueConstraintError || err instanceof ValidationError) {
    const status = err instanceof UniqueConstraintError ? 409 : 400;
    const detalles = err.errors.map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(status).json({ error: detalles[0]?.mensaje ?? 'Datos invalidos', detalles });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
