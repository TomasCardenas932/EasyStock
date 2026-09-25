import { useEffect, useRef, useState } from 'react'
import { listarProductos } from '../api/productos.js'
import { formatoPesos } from './entidades.js'
import './Catalogo.css'
import './Ventas.css'

const formatoPrecio = (precio) => (precio == null ? '-' : formatoPesos.format(precio))

// Listado de consulta para el mostrador: solo lo que hace falta para vender.
function Ventas() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [agregados, setAgregados] = useState([])
  const proximaClave = useRef(0)

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

  // Solo cuenta como seleccionado si esta a la vista: si la busqueda lo oculto,
  // Enter no agrega algo que el usuario no ve resaltado.
  const seleccionado = articulos.find((articulo) => articulo.id === seleccionadoId)

  // Enter pasa el articulo resaltado a la lista de agregados. Se escucha en todo
  // el documento para que funcione aunque el foco no este sobre la fila, salvo
  // en campos y botones, donde Enter ya tiene su propio uso.
  useEffect(() => {
    function handleEnter(e) {
      if (e.key !== 'Enter' || e.repeat || !seleccionado) return
      if (e.target.closest('input, textarea, select, button, a')) return

      e.preventDefault()
      const clave = proximaClave.current++
      setAgregados((actuales) => [
        ...actuales,
        {
          clave,
          codigo: seleccionado.codigo,
          nombre: seleccionado.nombre,
          precioPublico: seleccionado.precioPublico,
        },
      ])
      setSeleccionadoId(null)
    }

    document.addEventListener('keydown', handleEnter)
    return () => document.removeEventListener('keydown', handleEnter)
  }, [seleccionado])

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

          {agregados.length === 0 ? (
            <p className="catalogo-estado">
              Selecciona un articulo y apreta Enter para agregarlo.
            </p>
          ) : (
            <div className="tabla-contenedor ventas-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th className="num">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {agregados.map((agregado) => (
                    <tr key={agregado.clave}>
                      <td className="mono">{agregado.codigo}</td>
                      <td className="ventas-nombre">{agregado.nombre}</td>
                      <td className="num">{formatoPrecio(agregado.precioPublico)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Ventas
