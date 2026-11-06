// Roles (routes/roles.js). Las respuestas de los casos son las que dio la API
// al correr las pruebas contra la base de ejemplo.
const { ref, lista } = require('../esquemas');

const NOMBRE = {
  name: 'nombre',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const USUARIOS = 'Usuarios';

module.exports = {
  '/roles': {
    get: {
      etiqueta: 'Roles',
      resumen: 'Lista de roles',
      descripcion: 'Ordenada por nombre, cada rol con sus permisos.',
      permisos: [USUARIOS],
      respuesta: lista('Rol'),
      casos: [{
        titulo: 'Todos los roles',
        sesion: 'admin',
        status: 200,
        respuesta: [
          {
            id: 1,
            nombre: 'admin',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
            permisos: [
              { id: 3, nombre: 'Articulos' },
              { id: 2, nombre: 'Dashboard' },
              { id: 5, nombre: 'Movimientos' },
              { id: 1, nombre: 'Usuarios' },
              { id: 4, nombre: 'Ventas' },
            ],
          },
          {
            id: 2,
            nombre: 'empleado',
            createdAt: '2026-10-26T19:26:28.473Z',
            updatedAt: '2026-10-26T19:26:28.473Z',
            permisos: [{ id: 2, nombre: 'Dashboard' }, { id: 4, nombre: 'Ventas' }],
          },
        ],
      }],
    },
    post: {
      etiqueta: 'Roles',
      resumen: 'Alta de rol',
      descripcion: 'Sin permisoIds el rol se da de alta sin permisos. El rol y sus permisos se guardan juntos.',
      permisos: [USUARIOS],
      cuerpo: ref('RolAlta'),
      respuesta: ref('Rol'),
      casos: [
        {
          titulo: 'Alta con permisos',
          sesion: 'admin',
          body: { nombre: 'deposito', permisoIds: [2, 5] },
          status: 201,
          respuesta: {
            id: 3,
            nombre: 'deposito',
            createdAt: '2026-10-27T02:18:03.011Z',
            updatedAt: '2026-10-27T02:18:03.011Z',
            permisos: [{ id: 2, nombre: 'Dashboard' }, { id: 5, nombre: 'Movimientos' }],
          },
        },
        {
          titulo: 'Alta sin permisos',
          sesion: 'admin',
          body: { nombre: 'invitado' },
          status: 201,
          respuesta: {
            id: 4,
            nombre: 'invitado',
            createdAt: '2026-10-27T02:18:03.056Z',
            updatedAt: '2026-10-27T02:18:03.056Z',
            permisos: [],
          },
        },
        {
          titulo: 'Falta el nombre',
          sesion: 'admin',
          body: { permisoIds: [2] },
          status: 400,
          respuesta: {
            error: 'El nombre del rol es obligatorio',
            detalles: [{ campo: 'nombre', mensaje: 'El nombre del rol es obligatorio' }],
          },
        },
        {
          titulo: 'Permisos repetidos',
          sesion: 'admin',
          body: { nombre: 'caja', permisoIds: [4, 4] },
          status: 400,
          respuesta: {
            error: 'Hay permisos repetidos',
            detalles: [{ campo: 'permisoIds.1', mensaje: 'Hay permisos repetidos' }],
          },
        },
        {
          titulo: 'Permiso inexistente',
          sesion: 'admin',
          body: { nombre: 'caja', permisoIds: [4, 99] },
          status: 404,
          respuesta: {
            error: 'No existe el permiso con id 99',
            detalles: [{ campo: 'permisoIds', mensaje: 'Selecciona permisos validos' }],
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          body: { nombre: 'admin' },
          status: 409,
          respuesta: {
            error: 'Ya existe un rol con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un rol con ese nombre' }],
          },
        },
      ],
    },
  },

  '/roles/{nombre}': {
    get: {
      etiqueta: 'Roles',
      resumen: 'Rol por nombre',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      respuesta: ref('Rol'),
      casos: [
        {
          titulo: 'Rol encontrado',
          sesion: 'admin',
          params: { nombre: 'empleado' },
          status: 200,
          respuesta: {
            id: 2,
            nombre: 'empleado',
            createdAt: '2026-10-26T19:26:28.473Z',
            updatedAt: '2026-10-26T19:26:28.473Z',
            permisos: [{ id: 2, nombre: 'Dashboard' }, { id: 4, nombre: 'Ventas' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'gerente' },
          status: 404,
          respuesta: { error: 'No existe un rol con el nombre gerente' },
        },
      ],
    },
    put: {
      etiqueta: 'Roles',
      resumen: 'Cambio de nombre del rol',
      descripcion: 'Los permisos se cambian con PUT /roles/{nombre}/permisos.',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      cuerpo: ref('RolModificacion'),
      respuesta: ref('Rol'),
      casos: [
        {
          titulo: 'Cambio de nombre',
          sesion: 'admin',
          params: { nombre: 'deposito' },
          body: { nombre: 'compras' },
          status: 200,
          respuesta: {
            id: 3,
            nombre: 'compras',
            createdAt: '2026-10-27T02:18:03.011Z',
            updatedAt: '2026-10-27T02:18:03.227Z',
            permisos: [{ id: 2, nombre: 'Dashboard' }, { id: 5, nombre: 'Movimientos' }],
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          params: { nombre: 'compras' },
          body: { nombre: 'empleado' },
          status: 409,
          respuesta: {
            error: 'Ya existe un rol con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un rol con ese nombre' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'gerente' },
          body: { nombre: 'gerencia' },
          status: 404,
          respuesta: { error: 'No existe un rol con el nombre gerente' },
        },
      ],
    },
    delete: {
      etiqueta: 'Roles',
      resumen: 'Baja de rol',
      descripcion: 'Solo si no tiene usuarios asignados.',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      casos: [
        {
          titulo: 'Baja de un rol sin usuarios',
          sesion: 'admin',
          params: { nombre: 'invitado' },
          status: 204,
        },
        {
          titulo: 'Rol con usuarios',
          sesion: 'admin',
          params: { nombre: 'empleado' },
          status: 409,
          respuesta: {
            error: 'El rol empleado tiene 2 usuario(s) asignado(s): cambiales el rol antes de darlo de baja',
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'gerente' },
          status: 404,
          respuesta: { error: 'No existe un rol con el nombre gerente' },
        },
      ],
    },
  },

  '/roles/{nombre}/permisos': {
    put: {
      etiqueta: 'Roles',
      resumen: 'Permisos del rol',
      descripcion:
        'Reemplaza los permisos del rol por los de la lista. Vale en el proximo pedido de los usuarios con ese rol, sin volver a iniciar sesion. Al rol de la sesion no se le puede quitar el permiso Usuarios.',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      cuerpo: ref('RolPermisos'),
      respuesta: ref('Rol'),
      casos: [
        {
          titulo: 'Reemplazo de permisos',
          sesion: 'admin',
          params: { nombre: 'compras' },
          body: { permisoIds: [2, 3, 5] },
          status: 200,
          respuesta: {
            id: 3,
            nombre: 'compras',
            createdAt: '2026-10-27T02:18:03.011Z',
            updatedAt: '2026-10-27T02:18:03.227Z',
            permisos: [
              { id: 3, nombre: 'Articulos' },
              { id: 2, nombre: 'Dashboard' },
              { id: 5, nombre: 'Movimientos' },
            ],
          },
        },
        {
          titulo: 'Lista vacia: sin permisos',
          sesion: 'admin',
          params: { nombre: 'compras' },
          body: { permisoIds: [] },
          status: 200,
          respuesta: {
            id: 3,
            nombre: 'compras',
            createdAt: '2026-10-27T02:18:03.011Z',
            updatedAt: '2026-10-27T02:18:03.227Z',
            permisos: [],
          },
        },
        {
          titulo: 'Sin la lista',
          sesion: 'admin',
          params: { nombre: 'compras' },
          body: {},
          status: 400,
          respuesta: {
            error: 'Hay que indicar los permisos del rol',
            detalles: [{ campo: 'permisoIds', mensaje: 'Hay que indicar los permisos del rol' }],
          },
        },
        {
          titulo: 'Permiso inexistente',
          sesion: 'admin',
          params: { nombre: 'compras' },
          body: { permisoIds: [99] },
          status: 404,
          respuesta: {
            error: 'No existe el permiso con id 99',
            detalles: [{ campo: 'permisoIds', mensaje: 'Selecciona permisos validos' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'gerente' },
          body: { permisoIds: [2] },
          status: 404,
          respuesta: { error: 'No existe un rol con el nombre gerente' },
        },
        {
          titulo: 'Quitarle Usuarios al propio rol',
          sesion: 'admin',
          params: { nombre: 'admin' },
          body: { permisoIds: [2, 3, 4, 5] },
          status: 409,
          respuesta: {
            error: 'No podes quitarle el permiso Usuarios a tu propio rol',
            detalles: [{ campo: 'permisoIds', mensaje: 'Pedile a otro administrador que lo cambie' }],
          },
        },
      ],
    },
  },
};
