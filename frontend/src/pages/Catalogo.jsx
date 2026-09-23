import { useEffect, useState } from 'react'
import ENTIDADES from './entidades.js'
import './Catalogo.css'

// Pantalla unica para las tablas del sistema: el conmutador elige la entidad y
// los botones de ABM abren los modales que esa entidad declara en entidades.js.
function Catalogo() {
  const [claveEntidad, setClaveEntidad] = useState(ENTIDADES[0].clave)
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState(null)

  const entidad = ENTIDADES.find((e) => e.clave === claveEntidad)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarRegistros() {
      try {
        setRegistros(await entidad.listar(busquedaAplicada, { signal: controller.signal }))
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            `No se pudieron cargar los ${entidad.plural}. Verifica que el backend este corriendo.`,
          )
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarRegistros()
    return () => controller.abort()
  }, [entidad, version, busquedaAplicada])

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

  // Al cambiar de tabla la busqueda anterior no aplica: se limpia junto con el
  // aviso, y el efecto de carga vuelve a pedir la lista nueva.
  function cambiarEntidad(clave) {
    if (clave === claveEntidad) return
    setClaveEntidad(clave)
    setRegistros([])
    setCargando(true)
    setBusqueda('')
    setBusquedaAplicada('')
    setModal(null)
    setAviso(null)
    setError(null)
  }

  function handleExito(mensaje) {
    setModal(null)
    setAviso(mensaje)
    setVersion((v) => v + 1)
  }

  const ModalActivo = modal ? entidad.modales[modal] : null
  const sinRegistros = registros.length === 0
  const buscando = busquedaAplicada.trim() !== ''

  return (
    <section className="catalogo">
      <div className="catalogo-conmutador" role="group" aria-label="Tabla a mostrar">
        {ENTIDADES.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            className="catalogo-conmutador-opcion"
            aria-pressed={opcion.clave === claveEntidad}
            onClick={() => cambiarEntidad(opcion.clave)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <header className="catalogo-header">
        <div>
          <h1>{entidad.titulo}</h1>
          {!cargando && !error && (
            <p>
              {buscando
                ? `${registros.length} ${entidad.plural} encontrados`
                : `${registros.length} ${entidad.plural} registrados`}
            </p>
          )}
        </div>

        <div className="catalogo-acciones">
          <button type="button" className="btn btn-primario" onClick={() => setModal('alta')}>
            + Alta
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setModal('modificar')}
          >
            Modificar
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setModal('baja')}
          >
            Baja
          </button>
        </div>
      </header>

      <div className="catalogo-buscador">
        <label className="sr-only" htmlFor="buscador">
          {entidad.buscador.etiqueta}
        </label>
        <input
          id="buscador"
          type="search"
          autoComplete="off"
          placeholder={entidad.buscador.placeholder}
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

      {cargando && <p className="catalogo-estado">Cargando {entidad.plural}...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {!cargando && !error && sinRegistros && (
        <p className="catalogo-estado">
          {buscando
            ? `Ningun ${entidad.singular} coincide con "${busquedaAplicada}".`
            : `No hay ${entidad.plural} cargados.`}
        </p>
      )}

      {!cargando && !error && !sinRegistros && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                {entidad.columnas.map((columna) => (
                  <th key={columna.titulo} className={columna.clase === 'num' ? 'num' : undefined}>
                    {columna.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  {entidad.columnas.map((columna) => (
                    <td key={columna.titulo} className={columna.clase}>
                      {columna.valor(registro)}
                    </td>
                  ))}
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

export default Catalogo
