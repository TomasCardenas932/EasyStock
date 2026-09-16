'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      
    }
  }

  Producto.init(
    {
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { isInt: true, min: 0 },
      },
      costo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { isInt: true, min: 0 },
      },
      precioPublico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'precio_publico',
        validate: { isInt: true, min: 0 },
      },
      proveedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { isInt: true },
      },
    },
    {
      sequelize,
      modelName: 'Producto',
      tableName: 'productos',
      underscored: true,
    }
  );

  return Producto;
};
