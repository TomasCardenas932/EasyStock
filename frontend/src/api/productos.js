import { request } from './http.js'

const BASE = '/api/productos'

// El codigo se repite entre proveedores (BRD, regla 13): proveedorId indica
// de cual es el articulo, y null es el articulo sin proveedor. Sin
// proveedorId, el backend rechaza el codigo repetido con los candidatos.
const urlProducto = (codigo, proveedorId) => {
  const url = `${BASE}/${encodeURIComponent(codigo.trim())}`
  return proveedorId === undefined ? url : `${url}?proveedorId=${proveedorId ?? 'ninguno'}`
}

const listarProductos = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

const obtenerProducto = (codigo, proveedorId) => request(urlProducto(codigo, proveedorId))

const crearProducto = (datos) => request(BASE, { method: 'POST', body: datos })

const actualizarProducto = (codigo, proveedorId, datos) =>
  request(urlProducto(codigo, proveedorId), { method: 'PUT', body: datos })

const eliminarProducto = (codigo, proveedorId) =>
  request(urlProducto(codigo, proveedorId), { method: 'DELETE' })

export { eliminarProducto, urlProducto, listarProductos, actualizarProducto, obtenerProducto, crearProducto }
