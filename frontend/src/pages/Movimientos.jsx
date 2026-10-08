import { useEffect, useState } from 'react'
import { listarMovimientos } from '../api/movimientos.js'
import './Catalogo.css'

// 07/10/2026, 15:37:21
const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

// Textos para mostrar los valores que guarda el backend.
const TIPOS = { alta: 'Alta', baja: 'Baja', modificacion: 'Modificacion', venta: 'Venta' }
const ENTIDADES = { producto: 'Articulo', proveedor: 'Proveedor' }

// Unidades de stock que sumo o resto el movimiento. Sin cantidad, el
// movimiento no cambio el stock de ningun articulo.
const formatoCantidad = (cantidad) => {
  if (cantidad == null) return '-'
  return cantidad > 0 ? `+${cantidad}` : String(cantidad)
}

// Registro de solo lectura: los movimientos los genera el backend en cada
// alta, baja, modificacion o venta. Vienen ordenados del mas nuevo al mas viejo.
function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarMovimientos() {
      try {
        setMovimientos(await listarMovimientos({ signal: controller.signal }))
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('No se pudieron cargar los movimientos. Verifica que el backend este corriendo.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarMovimientos()
    return () => controller.abort()
  }, [])

  return (
    <section className="catalogo">
      <header className="catalogo-header">
        <div>
          <h1>Movimientos</h1>
          {!cargando && !error && <p>{movimientos.length} movimientos registrados</p>}
        </div>
      </header>

      {cargando && <p className="catalogo-estado">Cargando movimientos...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {!cargando && !error && movimientos.length === 0 && (
        <p className="catalogo-estado">Todavia no hay movimientos registrados.</p>
      )}

      {!cargando && !error && movimientos.length > 0 && (
        <div className="tabla-contenedor catalogo-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Tipo</th>
                <th>Identificador</th>
                <th>Entidad</th>
                <th>Detalle</th>
                <th className="num">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="num">{formatoFecha.format(new Date(movimiento.fecha))}</td>
                  <td>{TIPOS[movimiento.tipo] ?? movimiento.tipo}</td>
                  <td className="mono">{movimiento.identificador}</td>
                  <td>{ENTIDADES[movimiento.entidad] ?? movimiento.entidad}</td>
                  <td>{movimiento.detalle}</td>
                  <td className="num">{formatoCantidad(movimiento.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Movimientos
