import { Navigate, Outlet, Route, Routes } from 'react-router'
import Topbar from './components/Topbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import ConPermiso from './components/ConPermiso.jsx'
import Login from './pages/Login.jsx'
import PANTALLAS from './pages/pantallas.js'
import { useSesion } from './sesion/SesionContext.js'
import './App.css'

// Estructura de las pantallas con sesion: encabezado con el nombre del
// empleado (FRD, CA-10), barra lateral y la pantalla elegida.
function Principal() {
  const { usuario, permisos, cerrar } = useSesion()

  return (
    <div className="app">
      <Topbar
        appName="EasyStock"
        userName={`${usuario.nombre} ${usuario.apellido}`}
        onCerrarSesion={cerrar}
      />

      <div className="app-body">
        <Sidebar permisos={permisos} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RutaProtegida>
            <Principal />
          </RutaProtegida>
        }
      >
        {PANTALLAS.map(({ id, label, path, componente: Pantalla }) => (
          <Route
            key={id}
            path={path}
            element={
              <ConPermiso permiso={label}>
                <Pantalla />
              </ConPermiso>
            }
          />
        ))}
        {/* "/" y cualquier direccion que no existe van al Dashboard. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
