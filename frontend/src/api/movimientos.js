import { request } from './http.js'

const BASE = '/api/movimientos'

// Busca solo por fecha (dd/mm/aaaa o su principio) o por numero de
// identificador (#302).
const listarMovimientos = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

export { listarMovimientos }
