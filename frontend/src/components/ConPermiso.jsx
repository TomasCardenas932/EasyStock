import { Navigate } from 'react-router'
import PANTALLAS from '../pages/pantallas.js'
import { useSesion } from '../sesion/SesionContext.js'

// Una pantalla sin permiso no se abre aunque se escriba su URL: se redirige a
// la primera pantalla que el rol si tiene habilitada.
function ConPermiso({ permiso, children }) {
  const { permisos } = useSesion()

  if (permisos.includes(permiso)) return children

  const habilitada = PANTALLAS.find((pantalla) => pantalla.path && permisos.includes(pantalla.label))
  if (habilitada) return <Navigate to={habilitada.path} replace />

  return (
    <>
      <h1>Sin pantallas habilitadas</h1>
      <p>Tu rol no tiene permiso para ninguna pantalla. Pedile al gerente que te asigne uno.</p>
    </>
  )
}

export default ConPermiso
