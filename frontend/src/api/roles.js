import { request } from './http.js'

// Roles con sus permisos, para elegir el de cada usuario.
const listarRoles = (options) => request('/api/roles', options)

export { listarRoles }
