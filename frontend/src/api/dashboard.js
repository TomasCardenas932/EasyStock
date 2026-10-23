import { request } from './http.js'

// Cantidad de articulos cargados, sin stock, para reponer y sin precio al
// publico.
const obtenerResumen = (options) => request('/api/dashboard', options)

export { obtenerResumen }
