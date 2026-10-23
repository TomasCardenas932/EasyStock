// Reglas de reposicion del FRD. Estado del stock respecto del umbral minimo:
// sin stock (C1), bajo (C2) o null si esta por encima (C3) o no tiene umbral
// (C4). Solo los dos primeros se sugieren para reponer.
export function estadoStock({ stock, umbralMinimo }) {
  if (umbralMinimo == null || stock > umbralMinimo) return null
  return stock === 0 ? 'sinStock' : 'bajo'
}

export const ESTADOS = { sinStock: 'Sin stock', bajo: 'Bajo' }

// Reglas Q1 y Q2: llevar el stock al doble del umbral.
export const cantidadSugerida = ({ stock, umbralMinimo }) => 2 * umbralMinimo - stock
