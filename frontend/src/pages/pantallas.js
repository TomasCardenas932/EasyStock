import Dashboard from './Dashboard.jsx'
import Catalogo from './Catalogo.jsx'
import Ventas from './Ventas.jsx'
import Movimientos from './Movimientos.jsx'
import Usuarios from './Usuarios.jsx'

const PANTALLAS = [
  { id: 'SC001', label: 'Dashboard', path: '/dashboard', componente: Dashboard },
  { id: 'SC002', label: 'Articulos', path: '/articulos', componente: Catalogo },
  { id: 'SC003', label: 'Ventas', path: '/ventas', componente: Ventas },
  { id: 'SC004', label: 'Movimientos', path: '/movimientos', componente: Movimientos },
]

// Pantallas que no van en la barra lateral: se abren desde el menu del
// usuario, en el encabezado. Tambien piden el permiso con el nombre de label.
export const MENU_USUARIO = [
  {
    id: 'SC005',
    label: 'Usuarios',
    texto: 'Administrar usuarios',
    path: '/usuarios',
    componente: Usuarios,
  },
]

export default PANTALLAS
