const SIN_CONEXION = 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.'

export class ApiError extends Error {
  constructor(mensaje, status, detalles = []) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.detalles = detalles
  }
}

export async function request(url, { body, ...options } = {}) {
  let res
  try {
    res = await fetch(url, {
      ...options,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(SIN_CONEXION, 0)
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.error ?? SIN_CONEXION, res.status, data?.detalles ?? [])
  }
  return data
}
