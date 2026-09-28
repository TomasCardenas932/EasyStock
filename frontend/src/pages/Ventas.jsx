import { useEffect, useState } from 'react'
import { listarProductos } from '../api/productos.js'
import AgregarArticulo from '../components/ventas/AgregarArticulo.jsx'
import { formatoPesos, formatoPrecio } from './entidades.js'
import './Catalogo.css'
import './Ventas.css'

// Listado de consulta para el mostrador: solo lo que hace falta para vender.
function Ventas() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [agregados, setAgregados] = useState([])
  // Articulo que espera confirmacion y cantidad antes de sumarse a la venta.
  const [porAgregar, setPorAgregar] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarArticulos() {
      try {
        setArticulos(await listarProductos(busquedaAplicada, { signal: controller.signal }))
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('No se pudieron cargar los articulos. Verifica que el backend este corriendo.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarArticulos()
    return () => controller.abort()
  }, [busquedaAplicada])

  // Espera a que el usuario deje de escribir antes de consultar al backend.
  useEffect(() => {
    const timer = setTimeout(() => setBusquedaAplicada(busqueda), 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  // Solo cuenta como seleccionado si esta a la vista
  const seleccionado = articulos.find((articulo) => articulo.id === seleccionadoId)

  // Enter abre la confirmacion para el articulo resaltado.
  useEffect(() => {
    function handleEnter(e) {
      if (e.key !== 'Enter' || e.repeat || !seleccionado || porAgregar) return
      if (e.target.closest('input, textarea, select, button, a')) return

      e.preventDefault()
      setPorAgregar(seleccionado)
    }

    document.addEventListener('keydown', handleEnter)
    return () => document.removeEventListener('keydown', handleEnter)
  }, [seleccionado, porAgregar])

  // Si el articulo ya estaba en la venta se suma la cantidad a su fila en vez
  // de repetirlo.
  function confirmarAgregado(cantidad) {
    const articulo = porAgregar
    setAgregados((actuales) =>
      actuales.some((agregado) => agregado.id === articulo.id)
        ? actuales.map((agregado) =>
            agregado.id === articulo.id
              ? { ...agregado, cantidad: agregado.cantidad + cantidad }
              : agregado,
          )
        : [
            ...actuales,
            {
              id: articulo.id,
              codigo: articulo.codigo,
              nombre: articulo.nombre,
              precioPublico: articulo.precioPublico,
              cantidad,
            },
          ],
    )
    setPorAgregar(null)
    setSeleccionadoId(null)
  }

  // Un click marca el articulo; otro click sobre el mismo lo desmarca.
  function alternarSeleccion(id) {
    setSeleccionadoId((actual) => (actual === id ? null : id))
  }

  function handleTeclaFila(e, id) {
    if (e.key === ' ') {
      e.preventDefault()
      alternarSeleccion(id)
    }
  }

  const buscando = busquedaAplicada.trim() !== ''
  // Un articulo sin precio publico no suma.
  const total = agregados.reduce(
    (suma, agregado) => suma + (agregado.precioPublico ?? 0) * agregado.cantidad,
    0,
  )

  return (
    <section className="ventas">
      <div className="ventas-listado">
        {cargando && <p className="catalogo-estado">Cargando articulos...</p>}

        {error && <p className="catalogo-estado is-error">{error}</p>}

        {!cargando && !error && articulos.length === 0 && (
          <p className="catalogo-estado">
            {buscando
              ? `Ningun articulo coincide con "${busquedaAplicada}".`
              : 'No hay articulos cargados.'}
          </p>
        )}

        {!cargando && !error && articulos.length > 0 && (
          <div className="tabla-contenedor ventas-tabla ventas-lista">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th className="num">Precio publico</th>
                </tr>
              </thead>
              <tbody>
                {articulos.map((articulo) => (
                  <tr
                    key={articulo.id}
                    className={articulo.id === seleccionadoId ? 'is-seleccionado' : undefined}
                    tabIndex={0}
                    aria-selected={articulo.id === seleccionadoId}
                    onClick={() => alternarSeleccion(articulo.id)}
                    onKeyDown={(e) => handleTeclaFila(e, articulo.id)}
                  >
                    <td className="mono">{articulo.codigo}</td>
                    <td className="ventas-nombre">{articulo.nombre}</td>
                    <td className="num">{formatoPrecio(articulo.precioPublico)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ventas-lateral">
        <div className="ventas-buscador">
          <label className="ventas-titulo" htmlFor="ventas-buscar">
            Buscar articulo
          </label>
          <div className="catalogo-buscador">
            <input
              id="ventas-buscar"
              type="search"
              autoComplete="off"
              placeholder="Codigo o nombre"
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
        </div>

        <div className="ventas-agregados">
          <h2 className="ventas-titulo">Articulos agregados</h2>

          {/* La caja se muestra siempre, aunque este vacia, para que llegue
              hasta el total sin dejar un hueco en la columna. */}
          <div className="tabla-contenedor ventas-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th className="num">Cant.</th>
                  <th className="num">Precio</th>
                </tr>
              </thead>
              <tbody>
                {agregados.map((agregado) => (
                  <tr key={agregado.id}>
                    <td className="mono">{agregado.codigo}</td>
                    <td className="ventas-nombre" title={agregado.nombre}>
                      {agregado.nombre}
                    </td>
                    <td className="num">{agregado.cantidad}</td>
                    <td className="num">{formatoPrecio(agregado.precioPublico)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {agregados.length === 0 && (
              <p className="ventas-agregados-vacio">
                Selecciona un articulo y apreta Enter para agregarlo.
              </p>
            )}
          </div>

          <div className="ventas-total" role="status">
            <span className="ventas-total-etiqueta">Total</span>
            <span className="ventas-total-monto">{formatoPesos.format(total)}</span>
          </div>
        </div>
      </div>

      {porAgregar && (
        <AgregarArticulo
          articulo={porAgregar}
          onClose={() => setPorAgregar(null)}
          onConfirmar={confirmarAgregado}
        />
      )}
    </section>
  )
}

export default Ventas
