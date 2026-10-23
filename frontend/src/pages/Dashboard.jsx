import { useEffect, useState } from 'react'
import { obtenerResumen } from '../api/dashboard.js'
import { useSesion } from '../sesion/SesionContext.js'
import { ESTADOS, cantidadSugerida, estadoStock } from './reposicion.js'
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
  { clave: 'paraReponer', texto: 'Para reponer (sin stock o stock ≤ umbral)' },
  { clave: 'sinPrecio', texto: 'Sin precio al publico' },
]

// FRD, regla 1: los articulos mas urgentes de reponer, primero los que no
// tienen stock. total es la cantidad de articulos para reponer.
function ArticulosParaReponer({ articulos, total }) {
  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-reponer">
      <header className="dashboard-panel-header">
        <h2 id="dashboard-reponer">Articulos para reponer</h2>
        <p>Primero los que no tienen stock. Cantidad sugerida = 2 × umbral − stock.</p>
      </header>

      {articulos.length === 0 ? (
        <p className="dashboard-panel-vacio">No hay articulos para reponer.</p>
      ) : (
        <div className="dashboard-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Codigo</th>
                <th>Nombre</th>
                <th className="num">Stock</th>
                <th className="num">Umbral</th>
                <th className="num">Pedir</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((articulo) => {
                const estado = estadoStock(articulo)
                return (
                  <tr key={articulo.id}>
                    <td>
                      <span className={`estado-stock is-${estado}`}>{ESTADOS[estado]}</span>
                    </td>
                    <td className="mono">{articulo.codigo}</td>
                    <td className="is-largo">{articulo.nombre}</td>
                    <td className={estado === 'sinStock' ? 'num is-fuerte' : 'num'}>
                      {articulo.stock}
                    </td>
                    <td className="num">{articulo.umbralMinimo ?? '-'}</td>
                    <td className="num is-fuerte">{cantidadSugerida(articulo) ?? '-'}</td>
                    <td className="is-largo">{articulo.proveedor?.nombre ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {articulos.length < total && (
        <p className="dashboard-panel-pie">
          Se muestran los {articulos.length} mas urgentes de {total} articulos para reponer.
        </p>
      )}
    </section>
  )
}

// FRD, regla 2: los articulos sin precio al publico, que no se pueden vender
// hasta que se les asigne uno. total es la cantidad de articulos sin precio.
function ArticulosSinPrecio({ articulos, total }) {
  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-sin-precio">
      <header className="dashboard-panel-header">
        <h2 id="dashboard-sin-precio">Sin precio al publico</h2>
        <p>No se pueden vender hasta asignarles precio.</p>
      </header>

      {articulos.length === 0 ? (
        <p className="dashboard-panel-vacio">Todos los articulos tienen precio.</p>
      ) : (
        <ul className="dashboard-sin-precio">
          {articulos.map((articulo) => (
            <li key={articulo.id}>
              <span className="dashboard-sin-precio-nombre">
                <span className="mono">{articulo.codigo}</span> {articulo.nombre}
              </span>
              <span className="dashboard-sin-precio-proveedor">
                {articulo.proveedor?.nombre ?? 'Sin proveedor'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {articulos.length < total && (
        <p className="dashboard-panel-pie">
          Se muestran {articulos.length} de {total} articulos sin precio.
        </p>
      )}
    </section>
  )
}

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
  // { articulos, sinStock, paraReponer, sinPrecio, reponer, articulosSinPrecio,
  // fecha } o null mientras carga. Las dos listas traen solo los primeros
  // articulos, ya ordenados.
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

      {resumen && (
        <div className="dashboard-paneles">
          <ArticulosParaReponer articulos={resumen.reponer} total={resumen.paraReponer} />
          <ArticulosSinPrecio articulos={resumen.articulosSinPrecio} total={resumen.sinPrecio} />
        </div>
      )}
    </section>
  )
}

export default Dashboard
