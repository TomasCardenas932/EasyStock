import { useEffect, useState } from 'react'
import { listarProductos } from '../api/productos.js'
import { formatoPesos } from './entidades.js'
import './Catalogo.css'
import './Ventas.css'

// Listado de consulta para el mostrador: solo lo que hace falta para vender.
function Ventas() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')

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
          <div className="tabla-contenedor ventas-lista">
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
                  <tr key={articulo.id}>
                    <td className="mono">{articulo.codigo}</td>
                    <td className="ventas-nombre">{articulo.nombre}</td>
                    <td className="num">
                      {articulo.precioPublico == null
                        ? '-'
                        : formatoPesos.format(articulo.precioPublico)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ventas-buscador">
        <label className="ventas-buscador-titulo" htmlFor="ventas-buscar">
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
    </section>
  )
}

export default Ventas
