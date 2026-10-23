'use strict';

// Nombres de los permisos: uno por pantalla de la barra lateral, con la misma
// etiqueta (frontend/src/pages/pantallas.js). Los usan el seeder admin-inicial
// y las rutas, para pedir el permiso de la pantalla que usa cada pedido.
const PERMISOS = {
  DASHBOARD: 'Dashboard',
  ARTICULOS: 'Articulos',
  VENTAS: 'Ventas',
  MOVIMIENTOS: 'Movimientos',
};

module.exports = PERMISOS;
