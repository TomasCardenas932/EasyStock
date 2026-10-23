import { request } from './http.js'

const BASE = '/api/movimientos'

// Busca solo por fecha (dd/mm/aaaa o su principio) o por numero de
// identificador (#302).
const listarMovimientos = (buscar = '', options) => {
  const query = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return request(BASE + query, options)
}

// Suma unidades al stock de un articulo. Responde con el movimiento y el
// articulo con su stock nuevo.
const registrarEntrada = (entrada) =>
  request(`${BASE}/entradas`, { method: 'POST', body: entrada })

export { listarMovimientos, registrarEntrada }
