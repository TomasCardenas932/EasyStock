const ErrorHttp = require('../Excepciones/ErrorHttp');
const MENSAJES = require('../schemas/mensajes');
const { esquemaBusqueda } = require('../schemas/busquedaSchema');

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

const validarBusqueda = validar({ query: esquemaBusqueda });

module.exports = {
  validar,
  validarBusqueda,
};
