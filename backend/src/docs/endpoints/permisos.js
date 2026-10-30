// Permisos (routes/permisos.js). Las respuestas de los casos son las que dio la
// API al correr las pruebas contra la base de ejemplo.
const { ref, lista } = require('../esquemas');

const NOMBRE = {
  name: 'nombre',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const USUARIOS = 'Usuarios';

module.exports = {
  '/permisos': {
    get: {
      etiqueta: 'Permisos',
      resumen: 'Lista de permisos',
      descripcion: 'Ordenada por nombre. Hay un permiso por pantalla, con su mismo nombre (config/permisos.js).',
      permisos: [USUARIOS],
      respuesta: lista('Permiso'),
      casos: [{
        titulo: 'Todos los permisos',
        sesion: 'admin',
        status: 200,
        respuesta: [
          {
            id: 3,
            nombre: 'Articulos',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
          },
          {
            id: 2,
            nombre: 'Dashboard',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
          },
          {
            id: 5,
            nombre: 'Movimientos',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
          },
          {
            id: 1,
            nombre: 'Usuarios',
            createdAt: '2026-10-26T19:26:22.871Z',
            updatedAt: '2026-10-26T19:26:22.871Z',
          },
          {
            id: 4,
            nombre: 'Ventas',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
          },
        ],
      }],
    },
    post: {
      etiqueta: 'Permisos',
      resumen: 'Alta de permiso',
      descripcion: 'Un permiso nuevo solo habilita algo si alguna ruta lo pide.',
      permisos: [USUARIOS],
      cuerpo: ref('PermisoDatos'),
      respuesta: ref('Permiso'),
      casos: [
        {
          titulo: 'Alta',
          sesion: 'admin',
          body: { nombre: 'Reportes' },
          status: 201,
          respuesta: {
            id: 6,
            nombre: 'Reportes',
            updatedAt: '2026-10-27T02:18:03.612Z',
            createdAt: '2026-10-27T02:18:03.612Z',
          },
        },
        {
          titulo: 'Falta el nombre',
          sesion: 'admin',
          body: {},
          status: 400,
          respuesta: {
            error: 'El nombre del permiso es obligatorio',
            detalles: [{ campo: 'nombre', mensaje: 'El nombre del permiso es obligatorio' }],
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          body: { nombre: 'Ventas' },
          status: 409,
          respuesta: {
            error: 'Ya existe un permiso con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un permiso con ese nombre' }],
          },
        },
      ],
    },
  },

  '/permisos/{nombre}': {
    get: {
      etiqueta: 'Permisos',
      resumen: 'Permiso por nombre',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      respuesta: ref('Permiso'),
      casos: [
        {
          titulo: 'Permiso encontrado',
          sesion: 'admin',
          params: { nombre: 'Ventas' },
          status: 200,
          respuesta: {
            id: 4,
            nombre: 'Ventas',
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Informes' },
          status: 404,
          respuesta: { error: 'No existe un permiso con el nombre Informes' },
        },
      ],
    },
    put: {
      etiqueta: 'Permisos',
      resumen: 'Cambio de nombre del permiso',
      descripcion: 'Los permisos de las pantallas (config/permisos.js) no se pueden renombrar: las rutas los piden por su nombre.',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      cuerpo: ref('PermisoModificacion'),
      respuesta: ref('Permiso'),
      casos: [
        {
          titulo: 'Cambio de nombre',
          sesion: 'admin',
          params: { nombre: 'Reportes' },
          body: { nombre: 'Informes' },
          status: 200,
          respuesta: {
            id: 6,
            nombre: 'Informes',
            createdAt: '2026-10-27T02:18:03.612Z',
            updatedAt: '2026-10-27T02:18:03.755Z',
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          params: { nombre: 'Informes' },
          body: { nombre: 'Dashboard' },
          status: 409,
          respuesta: {
            error: 'Ya existe un permiso con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un permiso con ese nombre' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Compras' },
          body: { nombre: 'Pedidos' },
          status: 404,
          respuesta: { error: 'No existe un permiso con el nombre Compras' },
        },
        {
          titulo: 'Permiso de una pantalla',
          sesion: 'admin',
          params: { nombre: USUARIOS },
          body: { nombre: 'Administracion' },
          status: 409,
          respuesta: {
            error: 'El permiso Usuarios es de una pantalla del sistema: no se puede modificar ni dar de baja',
          },
        },
      ],
    },
    delete: {
      etiqueta: 'Permisos',
      resumen: 'Baja de permiso',
      descripcion: 'Se lo quita a los roles que lo tenian. Los permisos de las pantallas no se pueden dar de baja.',
      permisos: [USUARIOS],
      parametros: [NOMBRE],
      casos: [
        { titulo: 'Baja', sesion: 'admin', params: { nombre: 'Informes' }, status: 204 },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Compras' },
          status: 404,
          respuesta: { error: 'No existe un permiso con el nombre Compras' },
        },
        {
          titulo: 'Permiso de una pantalla',
          sesion: 'admin',
          params: { nombre: USUARIOS },
          status: 409,
          respuesta: {
            error: 'El permiso Usuarios es de una pantalla del sistema: no se puede modificar ni dar de baja',
          },
        },
      ],
    },
  },
};
