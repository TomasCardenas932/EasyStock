// Casos de prueba de la API: los de cada archivo de docs/endpoints/ y los que
// valen para todos los endpoints con sesion. Los usan la documentacion de
// Swagger (docs/openapi.js) y los tests (test/endpoints.test.js), que los
// corren en este orden.

const ENDPOINTS = [
  require('./endpoints/sesion'),
  require('./endpoints/productos'),
  require('./endpoints/proveedores'),
  require('./endpoints/ventas'),
  require('./endpoints/movimientos'),
  require('./endpoints/dashboard'),
  require('./endpoints/usuarios'),
  require('./endpoints/roles'),
  require('./endpoints/permisos'),
];

// Sin token, y con un rol que no tiene ninguno de los permisos que pide el
// endpoint.
const SIN_SESION = {
  titulo: 'Sin sesion',
  sesion: null,
  status: 401,
  respuesta: { error: 'Tenes que iniciar sesion para continuar' },
};

const sinPermiso = (permisos) => ({
  titulo: 'Rol sin el permiso',
  sesion: 'sin rol',
  status: 403,
  respuesta: {
    error: `Tu rol no tiene permiso para esta operacion (hace falta: ${permisos.join(' o ')})`,
  },
});

// Casos de una operacion. Las pruebas sin sesion y sin permiso usan los
// parametros del primer caso: no llegan a validarlos.
const casosDe = (op) => {
  const { params } = op.casos[0];
  return [
    ...op.casos,
    ...(op.publica ? [] : [{ ...SIN_SESION, params }]),
    ...(op.permisos ? [{ ...sinPermiso(op.permisos), params }] : []),
  ];
};

// Todas las operaciones, en orden: { ruta, metodo, op }.
const OPERACIONES = ENDPOINTS.flatMap((endpoints) =>
  Object.entries(endpoints).flatMap(([ruta, metodos]) =>
    Object.entries(metodos).map(([metodo, op]) => ({ ruta, metodo, op }))
  )
);

module.exports = { OPERACIONES, casosDe };
