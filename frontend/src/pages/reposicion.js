// Reglas de reposicion del FRD. Estado del stock: sin stock, tenga o no umbral
// minimo; bajo si esta en el umbral o por debajo (C2); null si esta por
// encima (C3) o no tiene umbral (C4). Solo los dos primeros se reponen.
export function estadoStock({ stock, umbralMinimo }) {
  if (stock === 0) return 'sinStock'
  if (umbralMinimo == null || stock > umbralMinimo) return null
  return 'bajo'
}

export const ESTADOS = { sinStock: 'Sin stock', bajo: 'Bajo' }

// Reglas Q1 y Q2: llevar el stock al doble del umbral. Sin umbral no hay
// cantidad sugerida.
export const cantidadSugerida = ({ stock, umbralMinimo }) =>
  umbralMinimo == null ? null : 2 * umbralMinimo - stock
