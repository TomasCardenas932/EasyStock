import Dashboard from './Dashboard.jsx'
import Catalogo from './Catalogo.jsx'
import Ventas from './Ventas.jsx'
import Movimientos from './Movimientos.jsx'

// Pantallas definidas en el BRD v1.2, seccion 5. Las usan la barra lateral y
// las rutas de App.jsx. Cada una se habilita con el permiso del rol que tiene
// el mismo nombre que su etiqueta (ver el seeder admin-inicial). Las que no
// tienen path todavia no estan hechas.
const PANTALLAS = [
  { id: 'SC001', label: 'Dashboard', path: '/', componente: Dashboard },
  { id: 'SC002', label: 'Articulos', path: '/articulos', componente: Catalogo },
  { id: 'SC003', label: 'Ventas', path: '/ventas', componente: Ventas },
  { id: 'SC004', label: 'Movimientos', path: '/movimientos', componente: Movimientos },
  { id: 'SC005', label: 'Alertas' },
  { id: 'SC006', label: 'Informes' },
]

export default PANTALLAS
