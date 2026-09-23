import { NavLink } from 'react-router'
import './Sidebar.css'

// Pantallas definidas en el BRD v1.2, seccion 5.
const SECTIONS = [
  { id: 'SC001', label: 'Dashboard', path: '/Dashboard' },
  { id: 'SC002', label: 'Articulos', path: '/articulos' },
  { id: 'SC003', label: 'Ventas' },
  { id: 'SC004', label: 'Movimientos' },
  { id: 'SC005', label: 'Alertas' },
  { id: 'SC006', label: 'Informes' },
]

function Sidebar({ sections = SECTIONS }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Navegacion principal">
        <ul className="sidebar-list">
          {sections.map((section) => (
            <li key={section.id} className="sidebar-item">
              {section.path ? (
                <NavLink to={section.path} className="sidebar-link is-navigable">
                  {section.label}
                </NavLink>
              ) : (
                <span className="sidebar-link">{section.label}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
