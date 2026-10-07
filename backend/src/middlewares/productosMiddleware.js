const Joi = require('joi');
const { Producto } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');

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

const esquemaAlta = Joi.object(CAMPOS);

// En la modificacion viajan solo los campos que cambian.
const esquemaModificacion = esquemaAlta.fork(['codigo', 'nombre', 'costo'], (campo) =>
  campo.optional()
);

const validarCodigo = validar({
  params: Joi.object({ codigo: texto('El codigo').required() }),
});

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el articulo de :codigo y lo deja en req.producto. El codigo solo es
// unico dentro de un proveedor: si dos proveedores usan el mismo, la operacion
// se frena en vez de elegir un articulo al azar.
const cargarProducto = async (req, res, next) => {
  const { codigo } = req.params;
  const productos = await Producto.findAll({
    where: { codigo },
    include: { association: 'proveedor', attributes: ['nombre'] },
  });

  if (productos.length === 0) {
    throw new ErrorHttp(404, `No existe un producto con el codigo ${codigo}`);
  }

  if (productos.length > 1) {
    throw new ErrorHttp(
      409,
      `Hay ${productos.length} articulos con el codigo ${codigo}: indica de que proveedor es.`,
      {
        candidatos: productos.map((producto) => ({
          id: producto.id,
          proveedorId: producto.proveedorId,
          proveedor: producto.proveedor?.nombre ?? null,
        })),
      }
    );
  }

  req.producto = productos[0];
  next();
};

module.exports = {
  validarCodigo,
  validarAlta,
  validarModificacion,
  cargarProducto,
};
