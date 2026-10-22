import './Topbar.css'

// Sin userName (pantalla de inicio de sesion) se muestra solo la marca.
function Topbar({ appName = 'EasyStock', userName, onCerrarSesion }) {
  return (
    <header className="topbar">
      <span className="topbar-brand">{appName}</span>

      {userName && (
        <div className="topbar-user">
          <span className="topbar-user-name">{userName}</span>
          <span className="topbar-user-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
            </svg>
          </span>
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
