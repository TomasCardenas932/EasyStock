'use strict';

const { Model } = require('sequelize');

const enteroNoNegativo = (campo) => ({
  isInt: { msg: `${campo} debe ser un numero entero` },
  min: { args: [0], msg: `${campo} no puede ser negativo` },
});

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
        unique: { msg: 'Ya existe un producto con ese codigo' },
        validate: {
          notNull: { msg: 'El codigo es obligatorio' },
          notEmpty: { msg: 'El codigo es obligatorio' },
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'El nombre es obligatorio' },
          notEmpty: { msg: 'El nombre es obligatorio' },
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notNull: { msg: 'El stock es obligatorio' },
          ...enteroNoNegativo('El stock'),
        },
      },
      costo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'El costo es obligatorio' },
          ...enteroNoNegativo('El costo'),
        },
      },
      precioPublico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'precio_publico',
        validate: {
          notNull: { msg: 'El precio publico es obligatorio' },
          ...enteroNoNegativo('El precio publico'),
        },
      },
      proveedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: enteroNoNegativo('El proveedor'),
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
