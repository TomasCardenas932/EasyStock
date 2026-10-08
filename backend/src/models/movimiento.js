const { Model } = require('sequelize');

const TIPOS = ['alta', 'baja', 'modificacion', 'venta'];
const ENTIDADES = ['producto', 'proveedor'];

const INDICE_UNICO = 'movimientos_identificador_unico';

// Los movimientos no se cargan a mano: los generan los hooks de Producto,
// Proveedor y Venta cada vez que se guarda una de esas operaciones.
module.exports = (sequelize, DataTypes) => {
  class Movimiento extends Model {
    // Guarda un movimiento con su identificador: el tipo, "#" y el numero que
    // le toca dentro de ese tipo (alta#1, alta#2, venta#1...). Los movimientos
    // no se borran, asi que ese numero es la cantidad de movimientos del tipo
    // mas uno. Corre en la transaccion de la operacion que lo genera.
    // Una cantidad en 0 (o sin cantidad) se guarda vacia: el movimiento no
    // cambio el stock de ningun articulo.
    static async registrar({ tipo, entidad, detalle, cantidad }, { transaction }) {
      const anteriores = await Movimiento.count({ where: { tipo }, transaction });
      return Movimiento.create(
        {
          identificador: `${tipo}#${anteriores + 1}`,
          tipo,
          entidad,
          detalle,
          cantidad: cantidad || null,
        },
        { transaction }
      );
    }
  }

  Movimiento.init(
    {
      identificador: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: INDICE_UNICO,
          msg: 'Ya existe un movimiento con ese identificador',
        },
        validate: {
          notNull: { msg: 'El identificador del movimiento es obligatorio' },
          notEmpty: { msg: 'El identificador del movimiento es obligatorio' },
        },
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'El tipo de movimiento es obligatorio' },
          isIn: { args: [TIPOS], msg: `El tipo de movimiento debe ser ${TIPOS.join(', ')}` },
        },
      },
      entidad: {
        // Tabla sobre la que se hizo la operacion. Una venta es siempre sobre
        // un producto.
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'La entidad del movimiento es obligatoria' },
          isIn: { args: [ENTIDADES], msg: `La entidad debe ser ${ENTIDADES.join(' o ')}` },
        },
      },
      detalle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'El detalle del movimiento es obligatorio' },
          notEmpty: { msg: 'El detalle del movimiento es obligatorio' },
        },
      },
      cantidad: {
        // Unidades de stock que sumo (positivo) o resto (negativo). Vacio si
        // no cambio el stock de ningun articulo.
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: 'La cantidad del movimiento debe ser un numero entero' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Movimiento',
      tableName: 'movimientos',
      underscored: true,
      // La fecha es la de alta del registro, igual que en las ventas. Un
      // movimiento no se edita, asi que no lleva updated_at.
      createdAt: 'fecha',
      updatedAt: false,
    }
  );

  return Movimiento;
};
