import { request } from './http.js'

const BASE = '/api/proveedores'

const listarProveedores = (options) => request(BASE, options)

export { listarProveedores }
