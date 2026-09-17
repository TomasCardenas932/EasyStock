import { useEffect, useState } from 'react'
import { listarProductos } from '../api/productos.js'
import AltaProducto from '../components/productos/AltaProducto.jsx'
import ModificarProducto from '../components/productos/ModificarProducto.jsx'
import BajaProducto from '../components/productos/BajaProducto.jsx'
import './Articulos.css'

const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const MODALES = {
  alta: AltaProducto,
  modificar: ModificarProducto,
  baja: BajaProducto,
}

function Articulos() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarArticulos() {
      try {
        setArticulos(await listarProductos({ signal: controller.signal }))
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
  }, [version])

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(timer)
  }, [aviso])

  function handleExito(mensaje) {
    setModal(null)
    setAviso(mensaje)
    setVersion((v) => v + 1)
  }

  const ModalActivo = modal ? MODALES[modal] : null
  const sinArticulos = articulos.length === 0

  return (
    <section className="articulos">
      <header className="articulos-header">
        <div>
          <h1>Articulos</h1>
          {!cargando && !error && <p>{articulos.length} articulos registrados</p>}
        </div>

        <div className="articulos-acciones">
          <button type="button" className="btn btn-primario" onClick={() => setModal('alta')}>
            + Alta
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setModal('modificar')}
            disabled={sinArticulos}
          >
            Modificar
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setModal('baja')}
            disabled={sinArticulos}
          >
            Baja
          </button>
        </div>
      </header>

      <div className="articulos-aviso" role="status">
        {aviso}
      </div>

      {cargando && <p className="articulos-estado">Cargando articulos...</p>}

      {error && <p className="articulos-estado is-error">{error}</p>}

      {!cargando && !error && sinArticulos && (
        <p className="articulos-estado">No hay articulos cargados.</p>
      )}

      {!cargando && !error && !sinArticulos && (
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

      {ModalActivo && <ModalActivo onClose={() => setModal(null)} onExito={handleExito} />}
    </section>
  )
}

export default Articulos
