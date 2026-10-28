import { useEffect, useState } from 'react'
import { listarUsuarios } from '../api/usuarios.js'
import AltaUsuario from '../components/usuarios/AltaUsuario.jsx'
import ModificarUsuario from '../components/usuarios/ModificarUsuario.jsx'
import BajaUsuario from '../components/usuarios/BajaUsuario.jsx'
import { useSesion } from '../sesion/SesionContext.js'
import './Catalogo.css'
import './Usuarios.css'

// SC005 - Administracion de usuarios (FRD, AR-11): alta, modificacion y baja
// de los usuarios y el rol de cada uno. Se abre desde el menu del usuario, con
// el permiso Usuarios. Como el nombre se puede repetir, la modificacion y la
// baja se eligen desde la fila del usuario.
function Usuarios() {
  const { usuario: sesion } = useSesion()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  // Cuadro abierto: { tipo: 'alta' | 'modificar' | 'baja', usuario }.
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarUsuarios() {
      try {
        setUsuarios(await listarUsuarios(busquedaAplicada, { signal: controller.signal }))
        setError(null)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('No se pudieron cargar los usuarios. Verifica que el backend este corriendo.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarUsuarios()
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

  function handleExito(mensaje) {
    setModal(null)
    setAviso(mensaje)
    setVersion((v) => v + 1)
  }

  const cerrarModal = () => setModal(null)
  const buscando = busquedaAplicada.trim() !== ''

  return (
    <section className="catalogo">
      <header className="catalogo-header">
        <div>
          <h1>Usuarios</h1>
          {!cargando && !error && (
            <p>
              {buscando
                ? `${usuarios.length} usuarios encontrados`
                : `${usuarios.length} usuarios registrados`}
            </p>
          )}
        </div>

        <div className="catalogo-acciones">
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => setModal({ tipo: 'alta' })}
          >
            + Alta
          </button>
        </div>
      </header>

      <div className="catalogo-buscador">
        <label className="sr-only" htmlFor="buscador-usuarios">
          Buscar usuarios
        </label>
        <input
          id="buscador-usuarios"
          type="search"
          autoComplete="off"
          placeholder="Buscar por nombre o apellido"
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

      {cargando && <p className="catalogo-estado">Cargando usuarios...</p>}

      {error && <p className="catalogo-estado is-error">{error}</p>}

      {!cargando && !error && usuarios.length === 0 && (
        <p className="catalogo-estado">
          {buscando
            ? `Ningun usuario coincide con "${busquedaAplicada}".`
            : 'No hay usuarios cargados.'}
        </p>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <div className="tabla-contenedor catalogo-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Rol</th>
                <th>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                // El usuario de la sesion no puede darse de baja.
                const propio = usuario.id === sesion.id
                return (
                  <tr key={usuario.id}>
                    <td>{usuario.apellido}</td>
                    <td>
                      {usuario.nombre}
                      {propio && <span className="usuarios-propio">(vos)</span>}
                    </td>
                    <td>{usuario.telefono}</td>
                    <td>{usuario.rol?.nombre ?? 'Sin rol'}</td>
                    <td>
                      <div className="usuarios-acciones">
                        <button
                          type="button"
                          className="btn btn-secundario"
                          onClick={() => setModal({ tipo: 'modificar', usuario })}
                        >
                          Modificar
                        </button>
                        <button
                          type="button"
                          className="btn btn-secundario"
                          onClick={() => setModal({ tipo: 'baja', usuario })}
                          disabled={propio}
                          title={propio ? 'No podes darte de baja a vos mismo' : undefined}
                        >
                          Baja
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'alta' && <AltaUsuario onClose={cerrarModal} onExito={handleExito} />}
      {modal?.tipo === 'modificar' && (
        <ModificarUsuario
          usuario={modal.usuario}
          propio={modal.usuario.id === sesion.id}
          onClose={cerrarModal}
          onExito={handleExito}
        />
      )}
      {modal?.tipo === 'baja' && (
        <BajaUsuario usuario={modal.usuario} onClose={cerrarModal} onExito={handleExito} />
      )}
    </section>
  )
}

export default Usuarios
