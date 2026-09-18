const BASE = '/api/productos'

const SIN_CONEXION = 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.'

export class ApiError extends Error {
  constructor(mensaje, status, detalles = []) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.detalles = detalles
  }
}

async function request(url, { body, ...options } = {}) {
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

const urlProducto = (codigo) => `${BASE}/${encodeURIComponent(codigo.trim())}`

const listarProductos = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

const obtenerProducto = (codigo) => request(urlProducto(codigo))

const crearProducto = (datos) => request(BASE, { method: 'POST', body: datos })

const actualizarProducto = (codigo, datos) =>
  request(urlProducto(codigo), { method: 'PUT', body: datos })

const eliminarProducto = (codigo) => request(urlProducto(codigo), { method: 'DELETE' })

export { eliminarProducto, urlProducto, listarProductos, actualizarProducto, obtenerProducto, crearProducto }
