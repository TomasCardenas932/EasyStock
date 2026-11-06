const { Op } = require('sequelize');
const { Producto } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const {
  esquemaCodigo,
  esquemaProveedorDelCodigo,
  esquemaAlta,
  esquemaModificacion,
} = require('../schemas/productosSchema');

const validarCodigo = validar({ params: esquemaCodigo, query: esquemaProveedorDelCodigo });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el articulo de :codigo y lo deja en req.producto. Si el codigo se
// repite entre proveedores (BRD, regla 13), ?proveedorId= indica cual es.
const cargarProducto = async (req, res, next) => {
  const { codigo } = req.params;
  const conProveedor = req.query.proveedorId !== undefined;
  const proveedorId = req.query.proveedorId === 'ninguno' ? null : req.query.proveedorId;
  const productos = await Producto.findAll({
    where: { codigo, ...(conProveedor && { proveedorId }) },
    include: { association: 'proveedor', attributes: ['nombre'] },
  });

  if (productos.length === 0) {
    throw new ErrorHttp(
      404,
      conProveedor
        ? `No existe un producto con el codigo ${codigo} para ese proveedor`
        : `No existe un producto con el codigo ${codigo}`
    );
  }

  // Sin ?proveedorId= no se opera sobre ninguno: se devuelven los candidatos
  // para que la pantalla pida elegir el proveedor.
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

// Un codigo solo se repite entre proveedores distintos, y no puede haber dos
// productos sin proveedor con el mismo codigo. Los indices unicos de la base
// lo frenan igual; aca se corta antes para que el mensaje diga cual de los dos
// casos es. En la modificacion se compara con lo que queda despues del cambio
// (lo que no viaja en el body se conserva) y se excluye al propio producto.
const verificarCodigoLibre = async (req, res, next) => {
  const actual = req.producto;
  const { codigo = actual?.codigo, proveedorId = actual?.proveedorId ?? null } = req.body;

  const repetido = await Producto.findOne({
    where: { codigo, proveedorId, ...(actual && { id: { [Op.ne]: actual.id } }) },
  });

  if (repetido) {
    const mensaje =
      proveedorId === null
        ? 'Ya existe un producto con ese codigo sin proveedor'
        : 'Ya existe un producto con ese codigo para ese proveedor';
    throw new ErrorHttp(409, mensaje, { detalles: [{ campo: 'codigo', mensaje }] });
  }

  next();
};

module.exports = {
  validarCodigo,
  validarAlta,
  validarModificacion,
  cargarProducto,
  verificarCodigoLibre,
};
