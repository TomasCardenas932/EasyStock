import { request } from './http.js'

const BASE = '/api/usuarios'

// El nombre se puede repetir: cada usuario se identifica por su id.
const urlUsuario = (id) => `${BASE}/${id}`

const listarUsuarios = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

const crearUsuario = (datos) => request(BASE, { method: 'POST', body: datos })

const actualizarUsuario = (id, datos) => request(urlUsuario(id), { method: 'PUT', body: datos })

const eliminarUsuario = (id) => request(urlUsuario(id), { method: 'DELETE' })

export { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario }
