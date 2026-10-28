'use strict';

// Nombres de los permisos: uno por pantalla, con la misma etiqueta
// (frontend/src/pages/pantallas.js). Usuarios no esta en la barra lateral: se
// abre desde el menu del usuario. Los usan el seeder admin-inicial y las
// rutas, para pedir el permiso de la pantalla que usa cada pedido.
const PERMISOS = {
  DASHBOARD: 'Dashboard',
  ARTICULOS: 'Articulos',
  VENTAS: 'Ventas',
  MOVIMIENTOS: 'Movimientos',
  USUARIOS: 'Usuarios',
};

module.exports = PERMISOS;
