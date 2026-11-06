import { Navigate, useLocation } from 'react-router'
import { useSesion } from '../sesion/SesionContext.js'

// FRD, regla 15: sin sesion iniciada, cualquier pantalla redirige al login.
// La ruta pedida viaja en el state para volver a ella despues de ingresar,
// salvo que la sesion se haya cerrado a mano.
function RutaProtegida({ children }) {
  const { usuario, cerradaAMano } = useSesion()
  const location = useLocation()

  // Todavia se esta verificando el token guardado.
  if (usuario === undefined) return null

  if (usuario === null) {
    const state = cerradaAMano ? undefined : { desde: location.pathname }
    return <Navigate to="/login" replace state={state} />
  }

  return children
}

export default RutaProtegida
