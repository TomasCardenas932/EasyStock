'use strict';

const { Model } = require('sequelize');

const INDICE_UNICO = 'productos_codigo_proveedor';

const enteroNoNegativo = (campo) => ({
  isInt: { msg: `${campo} debe ser un numero entero` },
  min: { args: [0], msg: `${campo} no puede ser negativo` },
});

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsTo(models.Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
    }
  }

  Producto.init(
    {
      codigo: {
        // Cada proveedor tiene su propia codificacion: el codigo es unico
        // dentro de un proveedor, no en toda la tabla (BRD v1.2, regla 8).
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: INDICE_UNICO,
          msg: 'Ya existe un producto con ese codigo para ese proveedor',
        },
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
        // Opcional: al importar un catalogo se cargan codigo y costo, y el
        // precio se asigna despues (BRD v1.2, regla 2).
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'precio_publico',
        validate: enteroNoNegativo('El precio publico'),
      },
      proveedorId: {
        // Clave foranea contra `proveedores`. La asociacion expone el objeto
        // completo bajo `proveedor`.
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'proveedor_id',
        unique: INDICE_UNICO,
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
