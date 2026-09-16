import { useEffect, useState } from 'react'
import './Articulos.css'

const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function Articulos() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarArticulos() {
      try {
        const res = await fetch('/api/productos', { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setArticulos(await res.json())
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
    <section className="articulos">
      <header className="articulos-header">
        <h1>Articulos</h1>
        {!cargando && !error && (
          <p>{articulos.length} articulos registrados</p>
        )}
      </header>

      {cargando && <p className="articulos-estado">Cargando articulos...</p>}

      {error && <p className="articulos-estado is-error">{error}</p>}

      {!cargando && !error && articulos.length === 0 && (
        <p className="articulos-estado">No hay articulos cargados.</p>
      )}

      {!cargando && !error && articulos.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th className="num">Stock</th>
                <th className="num">Costo</th>
                <th className="num">Precio publico</th>
                <th className="num">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((a) => (
                <tr key={a.id}>
                  <td className="mono">{a.codigo}</td>
                  <td>{a.nombre}</td>
                  <td className="num">{a.stock}</td>
                  <td className="num">{formatoPesos.format(a.costo)}</td>
                  <td className="num">{formatoPesos.format(a.precioPublico)}</td>
                  <td className="num">{a.proveedor ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Articulos
