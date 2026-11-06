import { createContext, useContext } from 'react'

export const SesionContext = createContext({
  usuario: null,
  permisos: [],
  cerradaAMano: false,
  iniciar: async () => {},
  cerrar: () => {},
})

export const useSesion = () => useContext(SesionContext)
