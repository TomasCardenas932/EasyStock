// Datos de ejemplo de la documentacion: proveedores, articulos y ventas de
// octubre de 2026, y un usuario por cada sesion de las pruebas. Las respuestas
// de docs/endpoints/ salen de correr las pruebas sobre estos datos, despues de
// las migraciones y de los seeders admin-inicial y rol-empleado. Los carga
// test/endpoints.test.js en la base temporal de los tests.
const { sequelize, Proveedor, Producto, Venta, Movimiento, Usuario, Rol } = require('../models');

const PROVEEDORES = [
  'Distribuidora Moto Sur',
  'Repuestos Andes',
  'Lubricantes del Centro',
  'Frenos Patagonia',
  'Cubiertas del Oeste',
];

// codigo, nombre, stock, costo, precio al publico, umbral minimo, proveedor
const ARTICULOS = [
  ['FIL-0001', 'Filtro de aceite Honda CG 150', 27, 3200, 5500, 8, 'Distribuidora Moto Sur'],
  ['FIL-0002', 'Filtro de aire Honda Wave 110', 9, 4300, 6900, 10, 'Distribuidora Moto Sur'],
  ['FIL-0003', 'Filtro de aire Yamaha YBR 125', 3, 4600, 7600, 5, 'Distribuidora Moto Sur'],
  ['BUJ-0001', 'Bujia NGK C7HSA', 39, 2600, 4500, 10, 'Distribuidora Moto Sur'],
  ['ESP-0001', 'Espejo retrovisor universal', 1, 2900, 5200, null, 'Distribuidora Moto Sur'],
  ['KIT-0001', 'Kit de transmision Yamaha YBR 125', 6, 28000, 42000, 3, 'Repuestos Andes'],
  ['KIT-0002', 'Kit de transmision Honda CG 150', 2, 26500, 39800, 4, 'Repuestos Andes'],
  ['CAD-0001', 'Cadena 428H x 118 eslabones', 11, 15400, 23900, 4, 'Repuestos Andes'],
  // Mismo codigo que el de Distribuidora Moto Sur (BRD, regla 13).
  ['FIL-0001', 'Filtro de aceite Honda CG 150', 12, 3000, 5400, 4, 'Repuestos Andes'],
  ['LUB-0001', 'Aceite 4T 10W40 1L', 43, 7800, 12500, 10, 'Lubricantes del Centro'],
  ['LUB-0002', 'Aceite 4T 20W50 1L', 18, 6900, 11200, 8, 'Lubricantes del Centro'],
  ['LUB-0003', 'Lubricante de cadena en aerosol 400 ml', 9, 5400, 8900, 8, 'Lubricantes del Centro'],
  ['LIQ-0001', 'Liquido de frenos DOT 4 250 ml', 2, 4100, 6700, 6, 'Frenos Patagonia'],
  ['PAS-0001', 'Pastillas de freno delanteras Bajaj Rouser 200', 15, 6500, 11000, 5, 'Frenos Patagonia'],
  ['PAS-0002', 'Pastillas de freno traseras Honda Titan 150', 5, 5900, 9800, 6, 'Frenos Patagonia'],
  ['ZAP-0001', 'Zapatas de freno Honda Wave 110', 8, 4800, 7900, 5, 'Frenos Patagonia'],
  ['CAM-0001', 'Camara 18 pulgadas', 21, 6100, 9900, 6, 'Cubiertas del Oeste'],
  ['CUB-0001', 'Cubierta trasera 90/90-18', 4, 35000, 54000, 4, 'Cubiertas del Oeste'],
  ['CUB-0002', 'Cubierta delantera 2.75-18', 5, 29500, 46000, 3, 'Cubiertas del Oeste'],
];

// Fecha de cada venta y sus articulos (codigo, cantidad). El FIL-0001 es el de
// Distribuidora Moto Sur, el primero cargado.
const VENTAS = [
  [[2026, 9, 20, 10, 15], [['FIL-0001', 2], ['BUJ-0001', 4]]],
  [[2026, 9, 21, 11, 40], [['KIT-0002', 1], ['CUB-0001', 1]]],
  [[2026, 9, 22, 16, 5], [['LIQ-0001', 2], ['PAS-0002', 2]]],
  [[2026, 9, 23, 12, 30], [['FIL-0003', 1], ['LUB-0001', 3]]],
  [[2026, 9, 24, 17, 50], [['KIT-0002', 1], ['ESP-0001', 1]]],
  [[2026, 9, 25, 10, 20], [['FIL-0001', 1], ['LUB-0003', 2]]],
];

// Corre la operacion y le pone la fecha indicada (hora local) a los movimientos
// y a la venta que genero. Asi la busqueda de Movimientos por fecha encuentra
// siempre lo mismo.
async function en([anio, mes, dia, hora, minuto], operacion) {
  const movimientosAntes = (await Movimiento.max('id')) ?? 0;
  const ventasAntes = (await Venta.max('id')) ?? 0;
  const resultado = await operacion();
  // Mismo formato con el que Sequelize guarda las fechas en SQLite.
  const fecha = new Date(anio, mes, dia, hora, minuto)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', ' +00:00');
  await sequelize.query('UPDATE movimientos SET fecha = :fecha WHERE id > :antes', {
    replacements: { fecha, antes: movimientosAntes },
  });
  await sequelize.query('UPDATE ventas SET fecha = :fecha WHERE id > :antes', {
    replacements: { fecha, antes: ventasAntes },
  });
  return resultado;
}

// En una transaccion, como los controllers: los hooks registran el movimiento
// con el autor.
const conAutor = (autor, guardar) =>
  sequelize.transaction((transaction) => guardar({ transaction, autor }));

async function cargarDatosDeEjemplo() {
  // Martina (admin) carga el catalogo y Juan (empleado) hace las ventas. Sofia
  // no tiene rol: es la sesion de las pruebas sin permiso.
  const admin = await Rol.findOne({ where: { nombre: 'admin' } });
  const empleado = await Rol.findOne({ where: { nombre: 'empleado' } });
  const martina = await Usuario.create({
    nombre: 'Martina',
    apellido: 'Gomez',
    email: 'martina.gomez@example.com',
    telefono: '11 45128730',
    contrasena: 'demo-martina',
    rolId: admin.id,
  });
  const juan = await Usuario.create({
    nombre: 'Juan',
    apellido: 'Lopez',
    email: 'juan.lopez@example.com',
    telefono: '11 52934417',
    contrasena: 'demo-juan',
    rolId: empleado.id,
  });
  await Usuario.create({
    nombre: 'Sofia',
    apellido: 'Paz',
    email: 'sofia.paz@example.com',
    telefono: '11 40001234',
    contrasena: 'demo-sofia',
    rolId: null,
  });
  const deMartina = martina.autor();
  const deJuan = juan.autor();

  const proveedores = {};
  let minuto = 5;
  for (const nombre of PROVEEDORES) {
    proveedores[nombre] = await en([2026, 9, 19, 9, minuto++], () =>
      conAutor(deMartina, (opciones) => Proveedor.create({ nombre }, opciones))
    );
  }

  const articulos = {};
  for (const [codigo, nombre, stock, costo, precioPublico, umbralMinimo, proveedor] of ARTICULOS) {
    const proveedorId = proveedores[proveedor].id;
    const datos = { codigo, nombre, stock, costo, precioPublico, umbralMinimo, proveedorId };
    const articulo = await en([2026, 9, 19, 9, minuto++], () =>
      conAutor(deMartina, (opciones) => Producto.create(datos, opciones))
    );
    articulos[codigo] ??= articulo;
  }

  // Como ventasController: descuenta el stock y guarda la venta con su
  // movimiento por articulo.
  for (const [cuando, lineas] of VENTAS) {
    await en(cuando, () =>
      conAutor(deJuan, async (opciones) => {
        const vendidos = [];
        for (const [codigo, cantidad] of lineas) {
          const articulo = articulos[codigo];
          await articulo.decrement('stock', { by: cantidad, transaction: opciones.transaction });
          vendidos.push({
            productoId: articulo.id,
            codigo: articulo.codigo,
            nombre: articulo.nombre,
            precio: articulo.precioPublico,
            cantidad,
          });
        }
        const total = vendidos.reduce((suma, vendido) => suma + vendido.precio * vendido.cantidad, 0);
        return Venta.create(
          { articulos: vendidos, total, usuarioId: deJuan.id, usuarioNombre: deJuan.nombre },
          opciones
        );
      })
    );
  }

  // Un cambio de precio y un articulo sin precio al publico.
  await en([2026, 9, 23, 17, 22], () =>
    conAutor(deMartina, (opciones) => articulos['FIL-0002'].update({ precioPublico: 7200 }, opciones))
  );
  await en([2026, 9, 24, 16, 3], () =>
    conAutor(deMartina, (opciones) =>
      Producto.create(
        {
          codigo: 'EMB-0001',
          nombre: 'Kit de embrague Motomel Blitz 110',
          stock: 4,
          costo: 18500,
          precioPublico: null,
          umbralMinimo: 2,
          proveedorId: proveedores['Repuestos Andes'].id,
        },
        opciones
      )
    )
  );
}

module.exports = { cargarDatosDeEjemplo };
