import { request } from './http.js'

const BASE = '/api/productos'

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
