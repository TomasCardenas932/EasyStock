import { useEffect, useMemo, useState } from 'react'
import { alVencerSesion, hayToken } from '../api/http.js'
import { cerrarSesion, iniciarSesion, obtenerSesion } from '../api/sesion.js'
import { SesionContext } from './SesionContext.js'

function SesionProvider({ children }) {
  // Con un token guardado (por ejemplo, al recargar la pagina) se pregunta al
  // backend de quien es antes de decidir si mostrar el login.
  const [usuario, setUsuario] = useState(() => (hayToken() ? undefined : null))
  // Al cerrar la sesion a mano no se recuerda la pantalla: el proximo ingreso
  // arranca en el Dashboard. Si la sesion vence, se vuelve a donde se estaba.
  const [cerradaAMano, setCerradaAMano] = useState(false)

  useEffect(() => {
    alVencerSesion(() => {
      setCerradaAMano(false)
      setUsuario(null)
    })
    if (!hayToken()) return

    let vigente = true
    obtenerSesion()
      .then((datos) => vigente && setUsuario(datos))
      .catch(() => vigente && setUsuario(null))
    return () => {
      vigente = false
    }
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      // Nombres de los permisos del rol; sin rol no hay ninguno.
      permisos: usuario?.rol?.permisos.map((permiso) => permiso.nombre) ?? [],
      cerradaAMano,
      iniciar: async (nombre, contrasena) => {
        setUsuario(await iniciarSesion(nombre, contrasena))
        setCerradaAMano(false)
      },
      cerrar: () => {
        cerrarSesion()
        setCerradaAMano(true)
        setUsuario(null)
      },
    }),
    [usuario, cerradaAMano]
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export default SesionProvider
