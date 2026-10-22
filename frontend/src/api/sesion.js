import { borrarToken, guardarToken, request } from './http.js'

const BASE = '/api/sesion'

// Devuelve el usuario, con su rol y permisos. El token queda guardado y viaja
// en todas las llamadas siguientes.
const iniciarSesion = async (nombre, contrasena) => {
  const { token, usuario } = await request(BASE, { method: 'POST', body: { nombre, contrasena } })
  guardarToken(token)
  return usuario
}

const obtenerSesion = () => request(BASE)

// El token no se guarda en el backend: alcanza con olvidarlo.
const cerrarSesion = () => borrarToken()

export { cerrarSesion, iniciarSesion, obtenerSesion }
