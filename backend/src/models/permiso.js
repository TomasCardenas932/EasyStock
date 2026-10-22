const { Model } = require('sequelize');

const INDICE_UNICO = 'permisos_nombre_unico';

module.exports = (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      // Un mismo permiso se puede asignar a varios roles: la relacion se
      // guarda en la tabla intermedia `rol_permisos`.
      Permiso.belongsToMany(models.Rol, {
        through: 'rol_permisos',
        foreignKey: 'permisoId',
        otherKey: 'rolId',
        as: 'roles',
      });
    }
  }

  Permiso.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: INDICE_UNICO,
          msg: 'Ya existe un permiso con ese nombre',
        },
        validate: {
          notNull: { msg: 'El nombre del permiso es obligatorio' },
          notEmpty: { msg: 'El nombre del permiso es obligatorio' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Permiso',
      tableName: 'permisos',
      underscored: true,
    }
  );

  return Permiso;
};
