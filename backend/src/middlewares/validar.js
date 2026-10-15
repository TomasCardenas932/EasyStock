const Joi = require('joi');
const ErrorHttp = require('../Excepciones/ErrorHttp');

// Mensajes en castellano, con el mismo texto que las validaciones de los
// modelos. {#label} es la etiqueta que cada esquema le pone a su campo.
const MENSAJES = {
  'any.required': '{#label} es obligatorio',
  'string.base': '{#label} debe ser un texto',
  'string.empty': '{#label} es obligatorio',
  'number.base': '{#label} debe ser un numero entero',
  'number.integer': '{#label} debe ser un numero entero',
  'number.unsafe': '{#label} es demasiado grande',
  'number.min': '{#label} no puede ser negativo',
  'object.base': 'El formato de los datos no es valido',
};

const OPCIONES = {
  // Junta todos los errores, asi el formulario marca cada campo a la vez.
  abortEarly: false,
  // Descarta los campos que no estan en el esquema: solo llegan al controller
  // los campos editables.
  stripUnknown: true,
  messages: MENSAJES,
  errors: { wrap: { label: false } },
};

const validar = (esquemas) => (req, res, next) => {
  for (const [parte, esquema] of Object.entries(esquemas)) {
    const { error, value } = esquema.validate(req[parte] ?? {}, OPCIONES);
    if (error) {
      const detalles = error.details.map((detalle) => ({
        campo: detalle.path.join('.'),
        mensaje: detalle.message,
      }));
      throw new ErrorHttp(400, detalles[0].mensaje, { detalles });
    }
    
    Object.defineProperty(req, parte, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  next();
};

const validarBusqueda = validar({
  query: Joi.object({ buscar: Joi.string().trim().allow('').default('').label('La busqueda') }),
});

module.exports = {
  MENSAJES,
  validar,
  validarBusqueda,
};
