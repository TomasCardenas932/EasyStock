// Inicio de sesion (routes/sesion.js). Las respuestas de los casos son las que
// dio la API al correr las pruebas contra la base de ejemplo.
const { ref } = require('../esquemas');

module.exports = {
  '/sesion': {
    post: {
      etiqueta: 'Sesion',
      resumen: 'Inicio de sesion',
      descripcion:
        'Devuelve el token de la sesion y el usuario con su rol y sus permisos. Si los datos no coinciden no dice cual de los dos fallo (regla 14).',
      publica: true,
      cuerpo: ref('Credenciales'),
      respuesta: ref('Sesion'),
      casos: [
        {
          titulo: 'Datos correctos',
          sesion: null,
          body: { email: 'tomas.cardenas@example.com', contrasena: 'demo-tomas' },
          status: 200,
          respuesta: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzkzMDUwMDAwLCJleHAiOjE3OTMwNzg4MDB9.ejemplo-de-firma',
            usuario: {
              id: 1,
              nombre: 'Tomas',
              apellido: 'Cardenas',
              email: 'tomas.cardenas@example.com',
              telefono: '11 12345678',
              rolId: 1,
              createdAt: '2026-10-26T19:26:25.718Z',
              updatedAt: '2026-10-26T19:26:25.718Z',
              rol: {
                id: 1,
                nombre: 'admin',
                permisos: [
                  { id: 1, nombre: 'Usuarios' },
                  { id: 2, nombre: 'Dashboard' },
                  { id: 3, nombre: 'Articulos' },
                  { id: 4, nombre: 'Ventas' },
                  { id: 5, nombre: 'Movimientos' },
                ],
              },
            },
          },
        },
        {
          titulo: 'Email con mayusculas',
          sesion: null,
          body: { email: 'Tomas.Cardenas@Example.com', contrasena: 'demo-tomas' },
          status: 200,
          respuesta: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzkzMDUwMDAwLCJleHAiOjE3OTMwNzg4MDB9.ejemplo-de-firma',
            usuario: {
              id: 1,
              nombre: 'Tomas',
              apellido: 'Cardenas',
              email: 'tomas.cardenas@example.com',
              telefono: '11 12345678',
              rolId: 1,
              createdAt: '2026-10-26T19:26:25.718Z',
              updatedAt: '2026-10-26T19:26:25.718Z',
              rol: {
                id: 1,
                nombre: 'admin',
                permisos: [
                  { id: 1, nombre: 'Usuarios' },
                  { id: 2, nombre: 'Dashboard' },
                  { id: 3, nombre: 'Articulos' },
                  { id: 4, nombre: 'Ventas' },
                  { id: 5, nombre: 'Movimientos' },
                ],
              },
            },
          },
        },
        {
          titulo: 'Contrasena incorrecta',
          sesion: null,
          body: { email: 'tomas.cardenas@example.com', contrasena: 'incorrecta' },
          status: 401,
          respuesta: { error: 'Email o contrasena incorrectos.' },
        },
        {
          titulo: 'Email inexistente',
          sesion: null,
          body: { email: 'pedro@example.com', contrasena: 'demo-pedro' },
          status: 401,
          respuesta: { error: 'Email o contrasena incorrectos.' },
        },
        {
          titulo: 'Falta la contrasena',
          sesion: null,
          body: { email: 'tomas.cardenas@example.com' },
          status: 400,
          respuesta: {
            error: 'La contrasena es obligatoria',
            detalles: [{ campo: 'contrasena', mensaje: 'La contrasena es obligatoria' }],
          },
        },
        {
          titulo: 'Email con otro formato',
          sesion: null,
          body: { email: 'Tomas', contrasena: 'demo-tomas' },
          status: 400,
          respuesta: {
            error: 'El email no es valido',
            detalles: [{ campo: 'email', mensaje: 'El email no es valido' }],
          },
        },
      ],
    },
    get: {
      etiqueta: 'Sesion',
      resumen: 'Usuario de la sesion',
      descripcion:
        'Usuario del token, con su rol y sus permisos. Los permisos se leen en cada pedido: un cambio de rol vale sin volver a iniciar sesion.',
      respuesta: ref('UsuarioDeLaSesion'),
      casos: [
        {
          titulo: 'Sesion iniciada',
          sesion: 'admin',
          status: 200,
          respuesta: {
            id: 1,
            nombre: 'Tomas',
            apellido: 'Cardenas',
            email: 'tomas.cardenas@example.com',
            telefono: '11 12345678',
            rolId: 1,
            createdAt: '2026-10-26T19:26:25.718Z',
            updatedAt: '2026-10-26T19:26:25.718Z',
            rol: {
              id: 1,
              nombre: 'admin',
              permisos: [
                { id: 1, nombre: 'Usuarios' },
                { id: 2, nombre: 'Dashboard' },
                { id: 3, nombre: 'Articulos' },
                { id: 4, nombre: 'Ventas' },
                { id: 5, nombre: 'Movimientos' },
              ],
            },
          },
        },
        {
          titulo: 'Token no valido',
          sesion: 'token no valido',
          status: 401,
          respuesta: { error: 'Tenes que iniciar sesion para continuar' },
        },
      ],
    },
  },
};
