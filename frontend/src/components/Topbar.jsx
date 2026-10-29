import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { TEMA_CLARO, TEMA_OSCURO, elegirTema, temaActual } from '../tema.js'
import './Topbar.css'

// Arranca con el tema que aplico main.jsx: el login y la app muestran el
// mismo estado aunque cada uno tenga su topbar.
function SwitchTema() {
  const [oscuro, setOscuro] = useState(() => temaActual() === TEMA_OSCURO)

  function alternar() {
    elegirTema(oscuro ? TEMA_CLARO : TEMA_OSCURO)
    setOscuro(!oscuro)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={oscuro}
      aria-label="Modo oscuro"
      className="topbar-tema"
      title={oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
      onClick={alternar}
    >
      <span className="topbar-tema-perilla" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          {oscuro ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.5" />
              <path
                d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </span>
    </button>
  )
}

// Sin userName (pantalla de inicio de sesion) se muestran solo la marca y el
// switch de tema. El nombre del usuario abre un menu con las pantallas de
// menu (cada una: { id, path, texto }) y, al final, la opcion de cerrar
// sesion.
function Topbar({ appName = 'EasyStock', userName, menu = [], onCerrarSesion }) {
  const [abierto, setAbierto] = useState(false)
  const menuRef = useRef(null)
  const botonRef = useRef(null)
  const conMenu = menu.length > 0 || Boolean(onCerrarSesion)

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

      <div className="topbar-acciones">
        <SwitchTema />

        {userName && (
          <div className="topbar-user">
            {conMenu ? (
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
                    {menu.length > 0 && onCerrarSesion && (
                      <li role="separator" className="topbar-menu-separador" />
                    )}
                    {onCerrarSesion && (
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="topbar-menu-opcion topbar-menu-salir"
                          onClick={() => {
                            setAbierto(false)
                            onCerrarSesion()
                          }}
                        >
                          Cerrar sesion
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ) : (
              usuario
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Topbar
