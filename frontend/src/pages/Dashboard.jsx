import { useEffect, useState } from 'react'
import { obtenerResumen } from '../api/dashboard.js'
import { useSesion } from '../sesion/SesionContext.js'
import './Catalogo.css'
import './Dashboard.css'

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// "Sin stock" se pinta en negro cuando hay articulos en cero: es lo primero
// que hay que reponer (FRD, regla 1).
const RECUADROS = [
  { clave: 'articulos', texto: 'Articulos cargados' },
  { clave: 'sinStock', texto: 'Sin stock', destacado: true },
  { clave: 'paraReponer', texto: 'Para reponer (stock ≤ umbral)' },
  { clave: 'sinPrecio', texto: 'Sin precio al publico' },
]

function saludo(fecha) {
  const hora = fecha.getHours()
  if (hora >= 5 && hora < 12) return 'Buenos dias'
  if (hora >= 12 && hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// FRD, SC001: mensaje de encabezado con el nombre del empleado (regla 0) y
// el estado del inventario. Los datos se piden cada vez que se abre la
// pantalla, asi reflejan las ventas y entradas que se hayan cargado.
function Dashboard() {
  const { usuario } = useSesion()
  const [ahora] = useState(() => new Date())
  // { articulos, sinStock, paraReponer, sinPrecio, fecha } o null mientras carga.
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarResumen() {
      try {
        const datos = await obtenerResumen({ signal: controller.signal })
        setResumen({ ...datos, fecha: new Date() })
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('No se pudo cargar el estado del inventario. Verifica que el backend este corriendo.')
        }
      }
    }

    cargarResumen()
    return () => controller.abort()
  }, [])

  return (
    <section className="dashboard">
      <header className="dashboard-bienvenida">
        <h1>
          {saludo(ahora)}, {usuario.nombre} {usuario.apellido}
        </h1>
        {resumen && (
          <p>
            Este es el estado del inventario al {formatoFecha.format(resumen.fecha)}. Se recalcula
            con cada venta, entrada o ajuste de stock.
          </p>
        )}
      </header>

      {!resumen && !error && <p className="catalogo-estado">Cargando el estado del inventario...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {resumen && (
        <ul className="dashboard-recuadros">
          {RECUADROS.map(({ clave, texto, destacado }) => (
            <li
              key={clave}
              className={
                destacado && resumen[clave] > 0
                  ? 'dashboard-recuadro is-destacado'
                  : 'dashboard-recuadro'
              }
            >
              <strong className="dashboard-recuadro-valor">{resumen[clave]}</strong>
              <span className="dashboard-recuadro-texto">{texto}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Dashboard
