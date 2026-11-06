// Proveedores (routes/proveedores.js). Las respuestas de los casos son las que
// dio la API al correr las pruebas contra la base de ejemplo.
const { ref, lista } = require('../esquemas');

const NOMBRE = {
  name: 'nombre',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const ARTICULOS = 'Articulos';

module.exports = {
  '/proveedores': {
    get: {
      etiqueta: 'Proveedores',
      resumen: 'Lista de proveedores',
      descripcion:
        'Ordenada y filtrada por nombre, con la cantidad de articulos de cada uno. Tambien alimenta el selector de proveedor del ABM de articulos.',
      permisos: [ARTICULOS],
      parametros: [
        {
          name: 'buscar',
          in: 'query',
          description: 'Parte del nombre. Sin texto trae todos.',
          schema: { type: 'string' },
        },
      ],
      respuesta: lista('Proveedor'),
      casos: [
        {
          titulo: 'Busqueda por nombre',
          sesion: 'admin',
          query: { buscar: 'repuestos' },
          status: 200,
          respuesta: [
            {
              id: 2,
              nombre: 'Repuestos Andes',
              createdAt: '2026-10-26T19:26:29.274Z',
              updatedAt: '2026-10-26T19:26:29.274Z',
              cantidadArticulos: 5,
            },
          ],
        },
        {
          titulo: 'Sin texto: todos',
          sesion: 'admin',
          status: 200,
          respuesta: [
            {
              id: 5,
              nombre: 'Cubiertas del Oeste',
              createdAt: '2026-10-26T19:26:29.426Z',
              updatedAt: '2026-10-26T19:26:29.426Z',
              cantidadArticulos: 3,
            },
            {
              id: 1,
              nombre: 'Distribuidora Moto Sur',
              createdAt: '2026-10-26T19:26:29.218Z',
              updatedAt: '2026-10-26T19:26:29.218Z',
              cantidadArticulos: 5,
            },
            {
              id: 4,
              nombre: 'Frenos Patagonia',
              createdAt: '2026-10-26T19:26:29.378Z',
              updatedAt: '2026-10-26T19:26:29.378Z',
              cantidadArticulos: 4,
            },
            {
              id: 3,
              nombre: 'Lubricantes del Centro',
              createdAt: '2026-10-26T19:26:29.325Z',
              updatedAt: '2026-10-26T19:26:29.325Z',
              cantidadArticulos: 4,
            },
            {
              id: 2,
              nombre: 'Repuestos Andes',
              createdAt: '2026-10-26T19:26:29.274Z',
              updatedAt: '2026-10-26T19:26:29.274Z',
              cantidadArticulos: 5,
            },
          ],
        },
      ],
    },
    post: {
      etiqueta: 'Proveedores',
      resumen: 'Alta de proveedor',
      descripcion: 'Registra el alta en Movimientos con el usuario de la sesion.',
      permisos: [ARTICULOS],
      cuerpo: ref('ProveedorDatos'),
      respuesta: ref('Proveedor'),
      casos: [
        {
          titulo: 'Alta',
          sesion: 'admin',
          body: { nombre: 'Accesorios Rider' },
          status: 201,
          respuesta: {
            id: 6,
            nombre: 'Accesorios Rider',
            updatedAt: '2026-10-27T02:18:01.613Z',
            createdAt: '2026-10-27T02:18:01.613Z',
            cantidadArticulos: 0,
          },
        },
        {
          titulo: 'Falta el nombre',
          sesion: 'admin',
          body: {},
          status: 400,
          respuesta: {
            error: 'El nombre es obligatorio',
            detalles: [{ campo: 'nombre', mensaje: 'El nombre es obligatorio' }],
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          body: { nombre: 'Frenos Patagonia' },
          status: 409,
          respuesta: {
            error: 'Ya existe un proveedor con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un proveedor con ese nombre' }],
          },
        },
      ],
    },
  },

  '/proveedores/{nombre}': {
    get: {
      etiqueta: 'Proveedores',
      resumen: 'Proveedor por nombre',
      permisos: [ARTICULOS],
      parametros: [NOMBRE],
      respuesta: ref('Proveedor'),
      casos: [
        {
          titulo: 'Proveedor encontrado',
          sesion: 'admin',
          params: { nombre: 'Lubricantes del Centro' },
          status: 200,
          respuesta: {
            id: 3,
            nombre: 'Lubricantes del Centro',
            createdAt: '2026-10-26T19:26:29.325Z',
            updatedAt: '2026-10-26T19:26:29.325Z',
            cantidadArticulos: 4,
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Motos del Norte' },
          status: 404,
          respuesta: { error: 'No existe un proveedor con el nombre Motos del Norte' },
        },
      ],
    },
    put: {
      etiqueta: 'Proveedores',
      resumen: 'Modificacion de proveedor',
      descripcion: 'Registra la modificacion en Movimientos con el usuario de la sesion.',
      permisos: [ARTICULOS],
      parametros: [NOMBRE],
      cuerpo: ref('ProveedorModificacion'),
      respuesta: ref('Proveedor'),
      casos: [
        {
          titulo: 'Cambio de nombre',
          sesion: 'admin',
          params: { nombre: 'Accesorios Rider' },
          body: { nombre: 'Accesorios Rider SRL' },
          status: 200,
          respuesta: {
            id: 6,
            nombre: 'Accesorios Rider SRL',
            createdAt: '2026-10-27T02:18:01.613Z',
            updatedAt: '2026-10-27T02:18:01.785Z',
            cantidadArticulos: 0,
          },
        },
        {
          titulo: 'Nombre repetido',
          sesion: 'admin',
          params: { nombre: 'Accesorios Rider SRL' },
          body: { nombre: 'Repuestos Andes' },
          status: 409,
          respuesta: {
            error: 'Ya existe un proveedor con ese nombre',
            detalles: [{ campo: 'nombre', mensaje: 'Ya existe un proveedor con ese nombre' }],
          },
        },
        {
          titulo: 'Nombre vacio',
          sesion: 'admin',
          params: { nombre: 'Accesorios Rider SRL' },
          body: { nombre: '' },
          status: 400,
          respuesta: {
            error: 'El nombre es obligatorio',
            detalles: [{ campo: 'nombre', mensaje: 'El nombre es obligatorio' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Motos del Norte' },
          body: { nombre: 'Motos del Sur' },
          status: 404,
          respuesta: { error: 'No existe un proveedor con el nombre Motos del Norte' },
        },
      ],
    },
    delete: {
      etiqueta: 'Proveedores',
      resumen: 'Baja de proveedor',
      descripcion:
        'Solo sin articulos asociados (regla 9). Registra la baja en Movimientos con el usuario de la sesion.',
      permisos: [ARTICULOS],
      parametros: [NOMBRE],
      casos: [
        {
          titulo: 'Baja sin articulos',
          sesion: 'admin',
          params: { nombre: 'Accesorios Rider SRL' },
          status: 204,
        },
        {
          titulo: 'Con articulos asociados',
          sesion: 'admin',
          params: { nombre: 'Frenos Patagonia' },
          status: 409,
          respuesta: {
            error: 'El proveedor indicado no existe o todavia tiene articulos asociados',
            detalles: [{ campo: 'proveedorId', mensaje: 'Selecciona un proveedor valido' }],
          },
        },
        {
          titulo: 'Nombre inexistente',
          sesion: 'admin',
          params: { nombre: 'Motos del Norte' },
          status: 404,
          respuesta: { error: 'No existe un proveedor con el nombre Motos del Norte' },
        },
      ],
    },
  },
};
