const { Model } = require('sequelize');

const INDICE_UNICO = 'roles_nombre_unico';

module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, { foreignKey: 'rolId', as: 'usuarios' });
      // Un rol tiene muchos permisos y un permiso puede estar en varios roles:
      // la relacion se guarda en la tabla intermedia `rol_permisos`.
      Rol.belongsToMany(models.Permiso, {
        through: 'rol_permisos',
        foreignKey: 'rolId',
        otherKey: 'permisoId',
        as: 'permisos',
      });
    }
  }

  Rol.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: INDICE_UNICO,
          msg: 'Ya existe un rol con ese nombre',
        },
        validate: {
          notNull: { msg: 'El nombre del rol es obligatorio' },
          notEmpty: { msg: 'El nombre del rol es obligatorio' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Rol',
      // Sin tableName explicito Sequelize pluralizaria en ingles ("Rols").
      tableName: 'roles',
      underscored: true,
    }
  );

  return Rol;
};
