const { Permiso } = require('../models');
const ErrorHttp = require('../Excepciones/ErrorHttp');
const { validar } = require('./validar');
const { esquemaNombre, esquemaAlta, esquemaModificacion } = require('../schemas/permisosSchema');

// Permisos de las pantallas: las rutas los piden por su nombre.
const DE_PANTALLAS = Object.values(require('../config/permisos'));

const validarNombre = validar({ params: esquemaNombre });

const validarAlta = validar({ body: esquemaAlta });

const validarModificacion = validar({ body: esquemaModificacion });

// Busca el permiso de :nombre y lo deja en req.permiso.
const cargarPermiso = async (req, res, next) => {
  const { nombre } = req.params;
  const permiso = await Permiso.findOne({ where: { nombre } });

  if (!permiso) {
    throw new ErrorHttp(404, `No existe un permiso con el nombre ${nombre}`);
  }

  req.permiso = permiso;
  next();
};

// Renombrar o dar de baja el permiso de una pantalla dejaria a todos los roles
// sin ella, y sin Usuarios nadie podria volver a asignarla. Corre despues de
// cargarPermiso.
const verificarPermisoEditable = (req, res, next) => {
  const { nombre } = req.permiso;

  if (DE_PANTALLAS.includes(nombre)) {
    throw new ErrorHttp(
      409,
      `El permiso ${nombre} es de una pantalla del sistema: no se puede modificar ni dar de baja`
    );
  }

  next();
};

module.exports = {
  validarNombre,
  validarAlta,
  validarModificacion,
  cargarPermiso,
  verificarPermisoEditable,
};
