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
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'precio_publico',
        validate: enteroNoNegativo('El precio publico'),
      },
      umbralMinimo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'umbral_minimo',
        validate: enteroNoNegativo('El umbral minimo'),
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
      // Cada alta, modificacion o baja queda en el registro de movimientos.
      // Se guarda con la transaccion de la operacion: si una falla, no queda
      // ninguna de las dos. El descuento de stock de una venta no pasa por
      // aca (decrement no corre hooks): lo registra la venta.
      // La cantidad es el stock que suma o resta cada operacion: el inicial en
      // el alta, la diferencia en la modificacion (previous todavia tiene el
      // valor anterior) y el que quedaba en la baja.
      hooks: {
        afterCreate: (producto, opciones) =>
          registrar('alta', producto, producto.stock, opciones),
        afterUpdate: (producto, opciones) =>
          registrar('modificacion', producto, producto.stock - producto.previous('stock'), opciones),
        afterDestroy: (producto, opciones) =>
          registrar('baja', producto, -producto.stock, opciones),
      },
    }
  );

  function registrar(tipo, producto, cantidad, { transaction }) {
    return sequelize.models.Movimiento.registrar(
      { tipo, entidad: 'producto', detalle: `${producto.codigo} - ${producto.nombre}`, cantidad },
      { transaction }
    );
  }

  return Producto;
};
