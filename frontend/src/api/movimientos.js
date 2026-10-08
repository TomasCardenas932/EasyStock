import { request } from './http.js'

const BASE = '/api/movimientos'

const listarMovimientos = (options) => request(BASE, options)

export { listarMovimientos }
