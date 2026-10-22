const Joi = require('joi');

const texto = (etiqueta) => Joi.string().trim().label(etiqueta);
const enteroNoNegativo = (etiqueta) => Joi.number().integer().min(0).label(etiqueta);
// Opcionales: null (o '') deja el campo vacio.
const opcional = (etiqueta) => enteroNoNegativo(etiqueta).allow(null).empty('');

const CAMPOS = {
  codigo: texto('El codigo').required(),
  nombre: texto('El nombre').required(),
  // Sin stock, el modelo lo da de alta en 0.
  stock: enteroNoNegativo('El stock'),
  costo: enteroNoNegativo('El costo').required(),
  // Se puede cargar solo el costo y fijar el precio despues (BRD v1.2, regla 2).
  precioPublico: opcional('El precio publico'),
  // Sin umbral el articulo no genera avisos de reposicion (BRD v1.3, AR-8).
  umbralMinimo: opcional('El umbral minimo'),
  proveedorId: opcional('El proveedor'),
};

const esquemaCodigo = Joi.object({ codigo: texto('El codigo').required() });

const esquemaAlta = Joi.object(CAMPOS);

// En la modificacion viajan solo los campos que cambian.
const esquemaModificacion = esquemaAlta.fork(['codigo', 'nombre', 'costo'], (campo) =>
  campo.optional()
);

module.exports = {
  esquemaCodigo,
  esquemaAlta,
  esquemaModificacion,
};
