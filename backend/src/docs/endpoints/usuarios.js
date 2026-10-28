// Usuarios (routes/usuarios.js). Las respuestas de los casos son las que dio la
// API al correr las pruebas contra la base de ejemplo.
const { ref, lista } = require('../esquemas');

const ID = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};

const USUARIOS = 'Usuarios';

module.exports = {
  '/usuarios': {
    get: {
      etiqueta: 'Usuarios',
      resumen: 'Lista de usuarios',
      descripcion: 'Ordenada por apellido y nombre, filtrada por nombre o apellido, con el rol de cada uno.',
      permisos: [USUARIOS],
      parametros: [
        {
          name: 'buscar',
          in: 'query',
          description: 'Parte del nombre o del apellido. Sin texto trae todos.',
          schema: { type: 'string' },
        },
      ],
      respuesta: lista('Usuario'),
      casos: [
        {
          titulo: 'Busqueda por apellido',
          sesion: 'admin',
          query: { buscar: 'lopez' },
          status: 200,
          respuesta: [
            {
              id: 3,
              nombre: 'Juan',
              apellido: 'Lopez',
              telefono: '11 52934417',
              rolId: 2,
              createdAt: '2026-10-26T19:26:29.139Z',
              updatedAt: '2026-10-26T19:26:29.139Z',
              rol: { id: 2, nombre: 'empleado' },
            },
          ],
        },
        {
          titulo: 'Sin texto: todos',
          sesion: 'admin',
          status: 200,
          respuesta: [
            {
              id: 1,
              nombre: 'Tomas',
              apellido: 'Cardenas',
              telefono: '11 61376740',
              rolId: 1,
              createdAt: '2026-10-26T19:26:25.718Z',
              updatedAt: '2026-10-26T19:26:25.718Z',
              rol: { id: 1, nombre: 'admin' },
            },
            {
              id: 2,
              nombre: 'Martina',
              apellido: 'Gomez',
              telefono: '11 45128730',
              rolId: 1,
              createdAt: '2026-10-26T19:26:29.060Z',
              updatedAt: '2026-10-26T19:26:29.060Z',
              rol: { id: 1, nombre: 'admin' },
            },
            {
              id: 3,
              nombre: 'Juan',
              apellido: 'Lopez',
              telefono: '11 52934417',
              rolId: 2,
              createdAt: '2026-10-26T19:26:29.139Z',
              updatedAt: '2026-10-26T19:26:29.139Z',
              rol: { id: 2, nombre: 'empleado' },
            },
            {
              id: 4,
              nombre: 'Sofia',
              apellido: 'Paz',
              telefono: '11 40001234',
              rolId: null,
              createdAt: '2026-10-27T02:17:53.976Z',
              updatedAt: '2026-10-27T02:17:53.976Z',
              rol: null,
            },
          ],
        },
      ],
    },
    post: {
      etiqueta: 'Usuarios',
      resumen: 'Alta de usuario',
      descripcion: 'La contrasena se guarda hasheada y no sale en la respuesta.',
      permisos: [USUARIOS],
      cuerpo: ref('UsuarioAlta'),
      respuesta: ref('Usuario'),
      casos: [
        {
          titulo: 'Alta con rol',
          sesion: 'admin',
          body: {
            nombre: 'Lucia',
            apellido: 'Fernandez',
            telefono: '11 47852236',
            contrasena: 'mostrador2026',
            rolId: 2,
          },
          status: 201,
          respuesta: {
            id: 5,
            nombre: 'Lucia',
            apellido: 'Fernandez',
            telefono: '11 47852236',
            rolId: 2,
            createdAt: '2026-10-27T02:18:02.475Z',
            updatedAt: '2026-10-27T02:18:02.475Z',
            rol: { id: 2, nombre: 'empleado' },
          },
        },
        {
          titulo: 'Alta sin rol',
          sesion: 'admin',
          body: {
            nombre: 'Diego',
            apellido: 'Ramos',
            telefono: '11 39016655',
            contrasena: 'deposito2026',
            rolId: null,
          },
          status: 201,
          respuesta: {
            id: 6,
            nombre: 'Diego',
            apellido: 'Ramos',
            telefono: '11 39016655',
            rolId: null,
            createdAt: '2026-10-27T02:18:02.555Z',
            updatedAt: '2026-10-27T02:18:02.555Z',
            rol: null,
          },
        },
        {
          titulo: 'Faltan datos obligatorios',
          sesion: 'admin',
          body: { nombre: 'Lucia' },
          status: 400,
          respuesta: {
            error: 'El apellido es obligatorio',
            detalles: [
              { campo: 'apellido', mensaje: 'El apellido es obligatorio' },
              { campo: 'telefono', mensaje: 'El telefono es obligatorio' },
              { campo: 'contrasena', mensaje: 'La contrasena es obligatoria' },
            ],
          },
        },
        {
          titulo: 'Telefono con otro formato',
          sesion: 'admin',
          body: {
            nombre: 'Lucia',
            apellido: 'Fernandez',
            telefono: '1147852236',
            contrasena: 'mostrador2026',
          },
          status: 400,
          respuesta: {
            error: 'El telefono debe tener el formato "11 12345678"',
            detalles: [
              { campo: 'telefono', mensaje: 'El telefono debe tener el formato "11 12345678"' },
            ],
          },
        },
        {
          titulo: 'Rol inexistente',
          sesion: 'admin',
          body: {
            nombre: 'Lucia',
            apellido: 'Fernandez',
            telefono: '11 47852236',
            contrasena: 'mostrador2026',
            rolId: 99,
          },
          status: 409,
          respuesta: {
            error: 'El rol indicado no existe',
            detalles: [{ campo: 'rolId', mensaje: 'Selecciona un rol valido' }],
          },
        },
      ],
    },
  },

  '/usuarios/{id}': {
    get: {
      etiqueta: 'Usuarios',
      resumen: 'Usuario por id',
      permisos: [USUARIOS],
      parametros: [ID],
      respuesta: ref('Usuario'),
      casos: [
        {
          titulo: 'Usuario encontrado',
          sesion: 'admin',
          params: { id: 3 },
          status: 200,
          respuesta: {
            id: 3,
            nombre: 'Juan',
            apellido: 'Lopez',
            telefono: '11 52934417',
            rolId: 2,
            createdAt: '2026-10-26T19:26:29.139Z',
            updatedAt: '2026-10-26T19:26:29.139Z',
            rol: { id: 2, nombre: 'empleado' },
          },
        },
        {
          titulo: 'Id inexistente',
          sesion: 'admin',
          params: { id: 999 },
          status: 404,
          respuesta: { error: 'No existe un usuario con el id 999' },
        },
        {
          titulo: 'Id no valido',
          sesion: 'admin',
          params: { id: 'abc' },
          status: 400,
          respuesta: {
            error: 'El usuario debe ser un numero entero',
            detalles: [{ campo: 'id', mensaje: 'El usuario debe ser un numero entero' }],
          },
        },
      ],
    },
    put: {
      etiqueta: 'Usuarios',
      resumen: 'Modificacion de usuario',
      descripcion:
        'Cambia solo los campos que viajan en el cuerpo; sin contrasena se conserva la que tenia. El usuario de la sesion no puede cambiarse el rol: si se lo quitara, nadie podria volver a darselo.',
      permisos: [USUARIOS],
      parametros: [ID],
      cuerpo: ref('UsuarioModificacion'),
      respuesta: ref('Usuario'),
      casos: [
        {
          titulo: 'Cambio de telefono y rol',
          sesion: 'admin',
          params: { id: 6 },
          body: { telefono: '11 39016600', rolId: 2 },
          status: 200,
          respuesta: {
            id: 6,
            nombre: 'Diego',
            apellido: 'Ramos',
            telefono: '11 39016600',
            rolId: 2,
            createdAt: '2026-10-27T02:18:02.555Z',
            updatedAt: '2026-10-27T02:18:02.743Z',
            rol: { id: 2, nombre: 'empleado' },
          },
        },
        {
          titulo: 'Datos propios sin cambiar el rol',
          sesion: 'admin',
          params: { id: 1 },
          body: { telefono: '11 61376740', rolId: 1 },
          status: 200,
          respuesta: {
            id: 1,
            nombre: 'Tomas',
            apellido: 'Cardenas',
            telefono: '11 61376740',
            rolId: 1,
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
            rol: { id: 1, nombre: 'admin' },
          },
        },
        {
          titulo: 'Cambio del propio rol',
          sesion: 'admin',
          params: { id: 1 },
          body: { rolId: 2 },
          status: 409,
          respuesta: {
            error: 'No podes cambiar tu propio rol',
            detalles: [{ campo: 'rolId', mensaje: 'Pedile a otro administrador que lo cambie' }],
          },
        },
        {
          titulo: 'Nombre vacio',
          sesion: 'admin',
          params: { id: 6 },
          body: { nombre: '' },
          status: 400,
          respuesta: {
            error: 'El nombre es obligatorio',
            detalles: [{ campo: 'nombre', mensaje: 'El nombre es obligatorio' }],
          },
        },
        {
          titulo: 'Id inexistente',
          sesion: 'admin',
          params: { id: 999 },
          body: { nombre: 'Pedro' },
          status: 404,
          respuesta: { error: 'No existe un usuario con el id 999' },
        },
      ],
    },
    delete: {
      etiqueta: 'Usuarios',
      resumen: 'Baja de usuario',
      descripcion:
        'El usuario de la sesion no puede darse de baja. Sus ventas y movimientos conservan el nombre.',
      permisos: [USUARIOS],
      parametros: [ID],
      casos: [
        { titulo: 'Baja', sesion: 'admin', params: { id: 6 }, status: 204 },
        {
          titulo: 'Baja del propio usuario',
          sesion: 'admin',
          params: { id: 1 },
          status: 409,
          respuesta: { error: 'No podes darte de baja a vos mismo' },
        },
        {
          titulo: 'Id inexistente',
          sesion: 'admin',
          params: { id: 999 },
          status: 404,
          respuesta: { error: 'No existe un usuario con el id 999' },
        },
      ],
    },
  },
};
