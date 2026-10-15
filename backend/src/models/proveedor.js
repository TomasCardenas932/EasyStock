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
      // Cada alta, modificacion o baja queda en el registro de movimientos,
      // con la transaccion de la operacion. Una baja frenada por la clave
      // foranea falla antes de llegar al hook y no registra nada.
      hooks: {
        afterCreate: (proveedor, opciones) => registrar('alta', proveedor, opciones),
        afterUpdate: (proveedor, opciones) => registrar('modificacion', proveedor, opciones),
        afterDestroy: (proveedor, opciones) => registrar('baja', proveedor, opciones),
      },
    }
  );

  function registrar(tipo, proveedor, { transaction }) {
    return sequelize.models.Movimiento.registrar(
      { tipo, entidad: 'proveedor', detalle: proveedor.nombre },
      { transaction }
    );
  }

  return Proveedor;
};
