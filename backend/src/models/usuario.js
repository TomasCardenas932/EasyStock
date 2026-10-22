const { Model } = require('sequelize');
const { hashear, coincide } = require('../utils/contrasenas');

// Codigo de area de 2 digitos, un espacio y 8 digitos de numero: "11 12345678".
const FORMATO_TELEFONO = /^\d{2} \d{8}$/;

const textoObligatorio = (msg) => ({
  notNull: { msg },
  notEmpty: { msg },
});

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, { foreignKey: 'rolId', as: 'rol' });
    }

    // Compara una contrasena ingresada con el hash guardado. El usuario tiene
    // que haberse buscado con el scope `conContrasena`: el scope por defecto
    // no trae esa columna.
    verificarContrasena(contrasena) {
      return coincide(contrasena, this.contrasena);
    }

    // El hash no sale nunca en las respuestas, ni siquiera recien creado el
    // usuario.
    toJSON() {
      const { contrasena, ...datos } = super.toJSON();
      return datos;
    }
  }

  Usuario.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: textoObligatorio('El nombre es obligatorio'),
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: textoObligatorio('El apellido es obligatorio'),
      },
      telefono: {
        // Se guarda como texto para conservar el espacio entre el codigo de
        // area y el numero.
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          ...textoObligatorio('El telefono es obligatorio'),
          is: {
            args: FORMATO_TELEFONO,
            msg: 'El telefono debe tener el formato "11 12345678"',
          },
        },
      },
      contrasena: {
        // Se valida el texto ingresado; el hook lo reemplaza por el hash
        // despues de validar.
        type: DataTypes.STRING,
        allowNull: false,
        validate: textoObligatorio('La contrasena es obligatoria'),
      },
      rolId: {
        // Clave foranea contra `roles`. Un usuario tiene como mucho un rol; la
        // asociacion expone el objeto completo bajo `rol`.
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'rol_id',
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'usuarios',
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['contrasena'] },
      },
      scopes: {
        // Solo para el inicio de sesion, donde hay que comparar la contrasena.
        conContrasena: {},
      },
      hooks: {
        // Corre al crear y al modificar; si la contrasena no cambio, ya esta
        // hasheada y no se toca. bulkCreate no pasa por aca salvo con
        // individualHooks.
        async beforeSave(usuario) {
          if (usuario.changed('contrasena')) {
            usuario.contrasena = await hashear(usuario.contrasena);
          }
        },
      },
    }
  );

  return Usuario;
};
