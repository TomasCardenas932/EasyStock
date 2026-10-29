// El tema elegido con el switch del topbar vive en localStorage: se conserva
// al cerrar el navegador. Sin eleccion guardada se sigue la preferencia del
// sistema operativo. Si el navegador bloquea el storage, la eleccion dura
// hasta recargar.
const CLAVE_TEMA = 'easystock.tema'

export const TEMA_CLARO = 'claro'
export const TEMA_OSCURO = 'oscuro'

export function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA)
    if (guardado === TEMA_CLARO || guardado === TEMA_OSCURO) return guardado
  } catch {
    // Sin storage: se usa la preferencia del sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? TEMA_OSCURO : TEMA_CLARO
}

// index.css redefine los colores segun el atributo data-tema del <html>.
export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema
}

export const temaActual = () => document.documentElement.dataset.tema

export function elegirTema(tema) {
  aplicarTema(tema)
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Queda aplicado hasta recargar.
  }
}
