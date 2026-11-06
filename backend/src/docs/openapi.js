// Especificacion OpenAPI de la API, que muestra Swagger UI en /api/docs
// (routes/docs.js). Cada archivo de docs/endpoints/ describe sus endpoints con
// los casos de prueba: el pedido, la sesion con la que se hizo y la respuesta
// que da la API. Aca se arman con ellos los ejemplos de Swagger y la tabla de
// pruebas de cada endpoint. npm test corre esos casos y compara las respuestas.
const { ESQUEMAS, ref } = require('./esquemas');
const { OPERACIONES, casosDe } = require('./pruebas');

const ETIQUETAS = [
  { name: 'Sesion', description: 'Inicio de sesion (pantalla SC000)' },
  { name: 'Articulos', description: 'ABM de articulos (pantalla SC002)' },
  { name: 'Proveedores', description: 'ABM de proveedores (pantalla SC002)' },
  { name: 'Ventas', description: 'Registro de ventas (pantalla SC003)' },
  { name: 'Movimientos', description: 'Registro de operaciones y entradas de stock (pantalla SC004)' },
  { name: 'Dashboard', description: 'Resumen del stock (pantalla SC001)' },
  { name: 'Usuarios', description: 'Administracion de usuarios (pantalla SC005)' },
  { name: 'Roles', description: 'Roles y sus permisos (pantalla SC005)' },
  { name: 'Permisos', description: 'Permisos de las pantallas (pantalla SC005)' },
];

const DESCRIPCION = [
  'API de EasyStock. Cada endpoint trae la tabla de sus pruebas y, en los ejemplos, el pedido y la respuesta de cada una.',
  '**Como probarla:** correr `POST /sesion` con "Try it out". Swagger guarda el token que devuelve y lo manda en los pedidos siguientes; tambien se puede pegar a mano en **Authorize**. El usuario del seeder admin-inicial es Tomas, con el email tomas.cardenas@example.com; su contrasena es la de la variable de entorno ADMIN_CONTRASENA o, sin ella, la que muestra el seeder en la consola. En las pruebas es demo-tomas.',
  '**Sesiones de las pruebas:** *admin* es Tomas (rol admin, todos los permisos); *empleado*, un usuario con el rol empleado (Dashboard y Ventas); *sin rol*, un usuario sin rol, que no tiene ningun permiso; *-*, un pedido sin token.',
  '**Respuestas de ejemplo:** salen de correr las pruebas en orden contra una base con los datos de ejemplo de docs/datosDeEjemplo.js (proveedores, articulos y ventas de octubre de 2026); `npm test` las vuelve a correr y verifica cada una. Con otra base cambian los ids, las fechas y el stock.',
  'Cualquier ruta que no existe responde 404 con `{ "error": "Ruta no encontrada" }`, y un cuerpo que no es JSON valido, 400.',
].join('\n\n');

const ESTADOS = {
  200: 'OK',
  201: 'Creado',
  204: 'Sin contenido',
  400: 'Datos no validos',
  401: 'Sin sesion',
  403: 'Sin permiso',
  404: 'No encontrado',
  409: 'Conflicto',
};

// Clave de un ejemplo a partir del titulo de su caso: "Codigo repetido" ->
// "codigo-repetido".
const clave = (titulo) =>
  titulo
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Pedido de un caso como se escribe en la tabla: GET /api/productos/FIL-0001?proveedorId=2
const pedido = (metodo, ruta, { params = {}, query = {} }) => {
  const camino = ruta.replace(/\{(\w+)\}/g, (_, nombre) => params[nombre]);
  const consulta = Object.entries(query)
    .map(([nombre, valor]) => `${nombre}=${valor}`)
    .join('&');
  return `${metodo.toUpperCase()} /api${camino}${consulta && `?${consulta}`}`;
};

const tablaDePruebas = (metodo, ruta, casos) =>
  [
    '**Pruebas**',
    '',
    '| Prueba | Sesion | Pedido | Respuesta |',
    '| --- | --- | --- | --- |',
    ...casos.map(
      (caso) =>
        `| ${caso.titulo} | ${caso.sesion ?? '-'} | \`${pedido(metodo, ruta, caso)}\` | ${caso.status} ${ESTADOS[caso.status]} |`
    ),
  ].join('\n');

// Un ejemplo por cada valor distinto que usan los casos en el parametro. Swagger
// UI carga el primero al hacer "Try it out": en uno opcional, el primero es
// mandarlo vacio, que es no mandarlo.
const conEjemplos = (parametro, casos) => {
  const ubicacion = parametro.in === 'path' ? 'params' : 'query';
  const ejemplos = parametro.required ? {} : { 'sin-valor': { value: '', titulos: ['Sin el parametro'] } };
  for (const caso of casos) {
    const valor = caso[ubicacion]?.[parametro.name];
    if (valor === undefined) continue;
    const ejemplo = (ejemplos[`valor-${clave(String(valor)) || 'vacio'}`] ??= { value: valor, titulos: [] });
    ejemplo.titulos.push(caso.titulo);
  }
  const lista = Object.entries(ejemplos).map(([nombre, { value, titulos }]) => [
    nombre,
    { summary: titulos.join(' / '), value },
  ]);
  const conValores = parametro.required ? lista.length : lista.length - 1;
  return conValores > 0 ? { ...parametro, examples: Object.fromEntries(lista) } : parametro;
};

const respuestas = (casos, esquema) => {
  const porStatus = {};
  for (const caso of casos) {
    const respuesta = (porStatus[caso.status] ??= { description: ESTADOS[caso.status] });
    if (caso.respuesta === undefined) continue;
    const contenido = (respuesta.content ??= {
      'application/json': { schema: caso.status < 400 ? esquema : ref('Error'), examples: {} },
    });
    contenido['application/json'].examples[clave(caso.titulo)] = {
      summary: caso.titulo,
      value: caso.respuesta,
    };
  }
  return porStatus;
};

const cuerpoDePedido = (casos, esquema) => {
  const conCuerpo = casos.filter((caso) => caso.body !== undefined);
  return {
    required: true,
    content: {
      'application/json': {
        schema: esquema,
        examples: Object.fromEntries(
          conCuerpo.map((caso) => [clave(caso.titulo), { summary: caso.titulo, value: caso.body }])
        ),
      },
    },
  };
};

// Pasa una operacion de docs/endpoints/ al formato de OpenAPI.
const operacion = (metodo, ruta, op) => {
  const casos = casosDe(op);
  const descripcion = [
    op.descripcion,
    op.permisos && `Permiso: ${op.permisos.join(' o ')}.`,
    tablaDePruebas(metodo, ruta, casos),
  ];

  return {
    tags: [op.etiqueta],
    summary: op.resumen,
    description: descripcion.filter(Boolean).join('\n\n'),
    ...(op.publica && { security: [] }),
    parameters: (op.parametros ?? []).map((parametro) => conEjemplos(parametro, casos)),
    ...(op.cuerpo && { requestBody: cuerpoDePedido(casos, op.cuerpo) }),
    responses: respuestas(casos, op.respuesta),
  };
};

const paths = {};
for (const { ruta, metodo, op } of OPERACIONES) {
  paths[ruta] ??= {};
  paths[ruta][metodo] = operacion(metodo, ruta, op);
}

module.exports = {
  openapi: '3.0.3',
  info: { title: 'EasyStock API', version: '1.0.0', description: DESCRIPCION },
  servers: [{ url: '/api' }],
  tags: ETIQUETAS,
  security: [{ sesion: [] }],
  components: {
    securitySchemes: {
      sesion: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token que devuelve POST /sesion',
      },
    },
    schemas: ESQUEMAS,
  },
  paths,
};
