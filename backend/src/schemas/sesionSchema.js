const Joi = require('joi');

// El usuario se identifica con su nombre (el campo `nombre` del modelo).
const esquemaCredenciales = Joi.object({
  nombre: Joi.string().trim().required().label('El usuario'),
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
