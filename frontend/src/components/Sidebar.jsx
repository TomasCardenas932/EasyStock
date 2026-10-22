import { NavLink } from 'react-router'
import PANTALLAS from '../pages/pantallas.js'
import './Sidebar.css'

// Solo se muestran las pantallas para las que el rol del usuario tiene un
// permiso con el mismo nombre que la etiqueta.
function Sidebar({ sections = PANTALLAS, permisos = [] }) {
  const habilitadas = sections.filter((section) => permisos.includes(section.label))

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Navegacion principal">
        <ul className="sidebar-list">
          {habilitadas.map((section) => (
            <li key={section.id} className="sidebar-item">
              {section.path ? (
                // end: el Dashboard ("/") no queda marcado en las demas pantallas.
                <NavLink to={section.path} end className="sidebar-link is-navigable">
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
