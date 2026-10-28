// Ventas (routes/ventas.js). Las respuestas de los casos son las que dio la API
// al correr las pruebas contra la base de ejemplo.
const { ref } = require('../esquemas');

module.exports = {
  '/ventas': {
    post: {
      etiqueta: 'Ventas',
      resumen: 'Registro de venta',
      descripcion:
        'Descuenta el stock de lo vendido y guarda la venta con el usuario de la sesion; cada articulo queda en Movimientos. Codigo, nombre y precio salen de la base. Si un articulo no tiene precio o no alcanza el stock no se registra nada (reglas 2 y 5).',
      permisos: ['Ventas'],
      cuerpo: ref('VentaAlta'),
      respuesta: ref('Venta'),
      casos: [
        {
          titulo: 'Venta registrada',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 4, cantidad: 2 }, { productoId: 8, cantidad: 1 }] },
          status: 201,
          respuesta: {
            id: 7,
            articulos: [
              {
                productoId: 4,
                codigo: 'BUJ-0001',
                nombre: 'Bujia NGK C7HSA',
                precio: 4500,
                cantidad: 2,
              },
              {
                productoId: 8,
                codigo: 'CAD-0001',
                nombre: 'Cadena 428H x 118 eslabones',
                precio: 23900,
                cantidad: 1,
              },
            ],
            total: 32900,
            usuarioId: 3,
            usuarioNombre: 'Juan Lopez',
            fecha: '2026-10-27T02:18:01.986Z',
          },
        },
        {
          titulo: 'Articulo repetido en la venta',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 10, cantidad: 1 }, { productoId: 10, cantidad: 2 }] },
          status: 201,
          respuesta: {
            id: 8,
            articulos: [
              {
                productoId: 10,
                codigo: 'LUB-0001',
                nombre: 'Aceite 4T 10W40 1L',
                precio: 12500,
                cantidad: 1,
              },
              {
                productoId: 10,
                codigo: 'LUB-0001',
                nombre: 'Aceite 4T 10W40 1L',
                precio: 12500,
                cantidad: 2,
              },
            ],
            total: 37500,
            usuarioId: 3,
            usuarioNombre: 'Juan Lopez',
            fecha: '2026-10-27T02:18:02.028Z',
          },
        },
        {
          titulo: 'Sin articulos',
          sesion: 'empleado',
          body: { articulos: [] },
          status: 400,
          respuesta: {
            error: 'La venta tiene que tener al menos un articulo',
            detalles: [
              { campo: 'articulos', mensaje: 'La venta tiene que tener al menos un articulo' },
            ],
          },
        },
        {
          titulo: 'Cantidad en cero',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 4, cantidad: 0 }] },
          status: 400,
          respuesta: {
            error: 'La cantidad debe ser mayor a 0',
            detalles: [
              { campo: 'articulos.0.cantidad', mensaje: 'La cantidad debe ser mayor a 0' },
            ],
          },
        },
        {
          titulo: 'Articulo sin precio',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 20, cantidad: 1 }] },
          status: 400,
          respuesta: {
            error: 'El articulo EMB-0001 no tiene precio al publico: asignale uno antes de venderlo',
          },
        },
        {
          titulo: 'Articulo inexistente',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 999, cantidad: 1 }] },
          status: 404,
          respuesta: { error: 'Uno de los articulos de la venta ya no existe' },
        },
        {
          titulo: 'Stock insuficiente',
          sesion: 'empleado',
          body: { articulos: [{ productoId: 4, cantidad: 1 }, { productoId: 18, cantidad: 5 }] },
          status: 409,
          respuesta: { error: 'No hay stock suficiente de CUB-0001: se pidieron 5 y hay 3' },
        },
      ],
    },
  },
};
