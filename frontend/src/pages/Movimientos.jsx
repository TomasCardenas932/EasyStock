import { useEffect, useState } from 'react'
import { listarMovimientos } from '../api/movimientos.js'
import EntradaStock from '../components/movimientos/EntradaStock.jsx'
import './Catalogo.css'
import './Movimientos.css'


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
const TIPOS = {
  alta: 'Alta',
  baja: 'Baja',
  modificacion: 'Modificacion',
  venta: 'Venta',
  entrada: 'Entrada',
}
const ENTIDADES = { producto: 'Articulo', proveedor: 'Proveedor' }

// Unidades de stock que sumo o resto el movimiento. Sin cantidad, el
// movimiento no cambio el stock de ningun articulo.
const formatoCantidad = (cantidad) => {
  if (cantidad == null) return '-'
  return cantidad > 0 ? `+${cantidad}` : String(cantidad)
}

// Registro de operaciones: el backend genera un movimiento en cada alta, baja,
// modificacion o venta. Aca solo se cargan las entradas de stock (FRD,
// SC004.1). Vienen ordenados del mas nuevo al mas viejo.
function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [cargandoEntrada, setCargandoEntrada] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarMovimientos() {
      try {
        setMovimientos(await listarMovimientos(busquedaAplicada, { signal: controller.signal }))
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            err.status === 400
              ? err.message
              : 'No se pudieron cargar los movimientos. Verifica que el backend este corriendo.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarMovimientos()
    return () => controller.abort()
  }, [busquedaAplicada, version])

  // Espera a que el usuario deje de escribir antes de consultar al backend.
  useEffect(() => {
    const timer = setTimeout(() => setBusquedaAplicada(busqueda), 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(timer)
  }, [aviso])

  // Cada entrada registrada recarga la lista, tambien las de "Registrar y
  // cargar otro", que dejan el cuadro abierto.
  function handleEntrada(mensaje) {
    setAviso(mensaje)
    setVersion((v) => v + 1)
  }

  const buscando = busquedaAplicada.trim() !== ''

  return (
    <section className="catalogo">
      <header className="catalogo-header">
        <div>
          <h1>Movimientos</h1>
          {!cargando && !error && (
            <p>
              {buscando
                ? `${movimientos.length} movimientos encontrados`
                : `${movimientos.length} movimientos registrados`}
            </p>
          )}
        </div>

        <div className="catalogo-acciones">
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => setCargandoEntrada(true)}
          >
            + Entrada de stock
          </button>
        </div>
      </header>

      <div className="catalogo-buscador">
        <label className="sr-only" htmlFor="buscador-movimientos">
          Buscar movimientos
        </label>
        <input
          id="buscador-movimientos"
          type="search"
          autoComplete="off"
          placeholder="Buscar por fecha (dd/mm/aaaa) o identificador (#302)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button
            type="button"
            className="catalogo-buscador-limpiar"
            onClick={() => setBusqueda('')}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="catalogo-aviso" role="status">
        {aviso}
      </div>

      {cargando && <p className="catalogo-estado">Cargando movimientos...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {!cargando && !error && movimientos.length === 0 && (
        <p className="catalogo-estado">
          {buscando
            ? `Ningun movimiento coincide con "${busquedaAplicada}".`
            : 'Todavia no hay movimientos registrados.'}
        </p>
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
                  <td>
                    {movimiento.detalle}
                    {movimiento.referencia && (
                      <span className="movimiento-referencia">Ref: {movimiento.referencia}</span>
                    )}
                  </td>
                  <td className="num">{formatoCantidad(movimiento.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cargandoEntrada && (
        <EntradaStock onClose={() => setCargandoEntrada(false)} onRegistrada={handleEntrada} />
      )}
    </section>
  )
}

export default Movimientos
