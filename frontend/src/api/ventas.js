import { request } from './http.js'

const BASE = '/api/ventas'

// Solo viajan el producto y la cantidad: el backend toma codigo, nombre y
// precio de la base y calcula el total.
const registrarVenta = (articulos) => request(BASE, { method: 'POST', body: { articulos } })

export { registrarVenta }
