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

  useEffect(() => {
    const controller = new AbortController()

    async function cargarArticulos() {
      try {
        setArticulos(await listarProductos('', { signal: controller.signal }))
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
  }, [])

  return (
    <section className="ventas">
   
      {cargando && <p className="catalogo-estado">Cargando articulos...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {!cargando && !error && articulos.length === 0 && (
        <p className="catalogo-estado">No hay articulos cargados.</p>
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
                  <td>{articulo.nombre}</td>
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
    </section>
  )
}

export default Ventas
