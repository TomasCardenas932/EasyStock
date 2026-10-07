'use strict';

const { Model } = require('sequelize');

const INDICE_UNICO = 'proveedores_nombre_unico';

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.Producto, { foreignKey: 'proveedorId', as: 'productos' });
    }
  }

  Proveedor.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: INDICE_UNICO,
          msg: 'Ya existe un proveedor con ese nombre',
        },
        validate: {
          notNull: { msg: 'El nombre es obligatorio' },
          notEmpty: { msg: 'El nombre es obligatorio' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Proveedor',
      // Sin tableName explicito Sequelize pluralizaria en ingles ("Proveedors").
      tableName: 'proveedores',
      underscored: true,
    }
  );

  return Proveedor;
};
