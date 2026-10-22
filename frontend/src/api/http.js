const SIN_CONEXION = 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.'

// El token de la sesion vive en sessionStorage: sobrevive a recargar la
// pagina, pero al cerrar la pestana hay que volver a iniciar sesion. Si el
// navegador bloquea el storage, la sesion dura hasta recargar.
const CLAVE_TOKEN = 'easystock.token'
let tokenEnMemoria = null

function leerToken() {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN) ?? tokenEnMemoria
  } catch {
    return tokenEnMemoria
  }
}

export const hayToken = () => leerToken() !== null

export function guardarToken(token) {
  tokenEnMemoria = token
  try {
    sessionStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Queda solo en memoria.
  }
}

export function borrarToken() {
  tokenEnMemoria = null
  try {
    sessionStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // No habia nada guardado.
  }
}

// Lo registra el proveedor de sesion: cuando el backend rechaza el token
// (vencido o invalido) la app vuelve a la pantalla de inicio de sesion.
let avisarSesionVencida = () => {}

export function alVencerSesion(callback) {
  avisarSesionVencida = callback
}

export class ApiError extends Error {
  constructor(mensaje, status, detalles = []) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.detalles = detalles
  }
}

export async function request(url, { body, ...options } = {}) {
  const token = leerToken()
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, {
      ...options,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(SIN_CONEXION, 0)
  }

  // Un 401 con token es una sesion que ya no vale. Sin token es el inicio de
  // sesion rechazado: lo muestra la pantalla de login.
  if (res.status === 401 && token) {
    borrarToken()
    avisarSesionVencida()
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.error ?? SIN_CONEXION, res.status, data?.detalles ?? [])
  }
  return data
}
