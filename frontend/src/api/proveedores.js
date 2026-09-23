import { request } from './http.js'

const BASE = '/api/proveedores'

// El nombre es unico, asi que identifica al proveedor igual que el codigo a un
// articulo. Se codifica porque suele llevar espacios.
const urlProveedor = (nombre) => `${BASE}/${encodeURIComponent(nombre.trim())}`

const listarProveedores = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

const obtenerProveedor = (nombre) => request(urlProveedor(nombre))

const crearProveedor = (datos) => request(BASE, { method: 'POST', body: datos })

const actualizarProveedor = (nombre, datos) =>
  request(urlProveedor(nombre), { method: 'PUT', body: datos })

const eliminarProveedor = (nombre) => request(urlProveedor(nombre), { method: 'DELETE' })

export {
  eliminarProveedor,
  urlProveedor,
  listarProveedores,
  actualizarProveedor,
  obtenerProveedor,
  crearProveedor,
}
