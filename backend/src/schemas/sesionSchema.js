const Joi = require('joi');

// El usuario se identifica con su email. Se pasa a minusculas, como lo guarda
// el modelo Usuario.
const esquemaCredenciales = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .label('El email')
    .messages({ 'string.email': '{#label} no es valido' }),
  // Sin trim: los espacios son parte de la contrasena.
  contrasena: Joi.string()
    .required()
    .label('La contrasena')
    .messages({
      'any.required': '{#label} es obligatoria',
      'string.empty': '{#label} es obligatoria',
    }),
});

module.exports = {
  esquemaCredenciales,
};
