const Joi = require('joi');

// Mismo formato que valida el modelo Usuario: codigo de area de 2 digitos,
// un espacio y 8 digitos de numero.
const FORMATO_TELEFONO = /^\d{2} \d{8}$/;

const texto = (etiqueta) => Joi.string().trim().label(etiqueta);

const CAMPOS = {
  nombre: texto('El nombre').required(),
  apellido: texto('El apellido').required(),
  // En minusculas, como lo guarda el modelo Usuario.
  email: texto('El email')
    .lowercase()
    .email()
    .required()
    .messages({ 'string.email': '{#label} no es valido' }),
  telefono: texto('El telefono')
    .pattern(FORMATO_TELEFONO)
    .required()
    .messages({ 'string.pattern.base': 'El telefono debe tener el formato "11 12345678"' }),
  // Sin trim: los espacios son parte de la contrasena.
  contrasena: Joi.string()
    .required()
    .label('La contrasena')
    .messages({
      'any.required': '{#label} es obligatoria',
      'string.empty': '{#label} es obligatoria',
    }),
  // Opcional: null (o '') deja al usuario sin rol.
  rolId: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .empty('')
    .label('El rol')
    .messages({ 'number.min': '{#label} no es valido' }),
};

const esquemaId = Joi.object({
  id: Joi.number()
    .integer()
    .min(1)
    .required()
    .label('El usuario')
    .messages({ 'number.min': '{#label} no es valido' }),
});

const esquemaAlta = Joi.object(CAMPOS);

// En la modificacion viajan solo los campos que cambian. Sin contrasena, se
// conserva la que tenia.
const esquemaModificacion = esquemaAlta.fork(
  ['nombre', 'apellido', 'email', 'telefono', 'contrasena'],
  (campo) => campo.optional()
);

module.exports = {
  esquemaId,
  esquemaAlta,
  esquemaModificacion,
};
