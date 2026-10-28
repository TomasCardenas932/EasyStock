import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import './Topbar.css'

// Sin userName (pantalla de inicio de sesion) se muestra solo la marca. Con
// opciones en menu, el nombre del usuario abre un menu con esas pantallas
// (cada una: { id, path, texto }).
function Topbar({ appName = 'EasyStock', userName, menu = [], onCerrarSesion }) {
  const [abierto, setAbierto] = useState(false)
  const menuRef = useRef(null)
  const botonRef = useRef(null)

  // El menu se cierra con un click afuera o con Escape, que devuelve el foco
  // al boton.
  useEffect(() => {
    if (!abierto) return

    function handleClick(event) {
      if (!menuRef.current.contains(event.target)) setAbierto(false)
    }
    function handleTecla(event) {
      if (event.key !== 'Escape') return
      setAbierto(false)
      botonRef.current.focus()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleTecla)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleTecla)
    }
  }, [abierto])

  const usuario = (
    <>
      <span className="topbar-user-name">{userName}</span>
      <span className="topbar-user-avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
      </span>
    </>
  )

  return (
    <header className="topbar">
      <span className="topbar-brand">{appName}</span>

      {userName && (
        <div className="topbar-user">
          {menu.length > 0 ? (
            <div className="topbar-menu" ref={menuRef}>
              <button
                ref={botonRef}
                type="button"
                className="topbar-menu-boton"
                aria-haspopup="menu"
                aria-expanded={abierto}
                onClick={() => setAbierto((actual) => !actual)}
              >
                {usuario}
                <svg
                  className="topbar-menu-flecha"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5H7Z" />
                </svg>
              </button>

              {abierto && (
                <ul className="topbar-menu-lista" role="menu">
                  {menu.map((opcion) => (
                    <li key={opcion.id} role="none">
                      <Link
                        role="menuitem"
                        to={opcion.path}
                        className="topbar-menu-opcion"
                        onClick={() => setAbierto(false)}
                      >
                        {opcion.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            usuario
          )}
          {onCerrarSesion && (
            <button type="button" className="topbar-salir" onClick={onCerrarSesion}>
              Cerrar sesion
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default Topbar
