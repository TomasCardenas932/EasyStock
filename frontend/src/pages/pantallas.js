import Dashboard from './Dashboard.jsx'
import Catalogo from './Catalogo.jsx'
import Ventas from './Ventas.jsx'
import Movimientos from './Movimientos.jsx'

const PANTALLAS = [
  { id: 'SC001', label: 'Dashboard', path: '/dashboard', componente: Dashboard },
  { id: 'SC002', label: 'Articulos', path: '/articulos', componente: Catalogo },
  { id: 'SC003', label: 'Ventas', path: '/ventas', componente: Ventas },
  { id: 'SC004', label: 'Movimientos', path: '/movimientos', componente: Movimientos },
]

export default PANTALLAS
