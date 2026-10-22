import { createContext, useContext } from 'react'

// usuario: undefined mientras se verifica un token guardado, null sin sesion,
// o el usuario de la sesion (con su rol y permisos). permisos: los nombres de
// los permisos del rol. cerradaAMano: la ultima sesion la cerro el usuario (y
// no vencio).
export const SesionContext = createContext({
  usuario: null,
  permisos: [],
  cerradaAMano: false,
  iniciar: async () => {},
  cerrar: () => {},
})

export const useSesion = () => useContext(SesionContext)
