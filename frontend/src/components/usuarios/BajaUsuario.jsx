import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal.jsx'
import { eliminarUsuario } from '../../api/usuarios.js'
import '../abm.css'

// El usuario llega elegido desde su fila del listado.
function BajaUsuario({ usuario, onClose, onExito }) {
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState(null)
  const volverRef = useRef(null)

  // Foco en "Volver": la opcion segura ante una accion irreversible.
  useEffect(() => {
    volverRef.current.focus()
  }, [])

  async function handleConfirmar() {
    setEliminando(true)
    setError(null)
    try {
      await eliminarUsuario(usuario.id)
      onExito(`Usuario ${usuario.nombre} ${usuario.apellido} dado de baja`)
    } catch (err) {
      setError(err.message)
      setEliminando(false)
    }
  }

  return (
    <Modal titulo="Baja de usuario" onClose={onClose}>
      <div className="abm-form">
        <p className="form-descripcion">Vas a dar de baja el siguiente usuario:</p>

        <dl className="abm-resumen">
          <dt>Nombre</dt>
          <dd>
            {usuario.nombre} {usuario.apellido}
          </dd>
          <dt>Telefono</dt>
          <dd>{usuario.telefono}</dd>
          <dt>Rol</dt>
          <dd>{usuario.rol?.nombre ?? 'Sin rol'}</dd>
        </dl>

        <p className="baja-advertencia">
          No va a poder volver a iniciar sesion. Esta accion no se puede deshacer. ¿Confirmas la
          baja?
        </p>

        {error && (
          <p className="form-error-general" role="alert">
            {error}
          </p>
        )}

        <div className="form-acciones">
          <button
            ref={volverRef}
            type="button"
            className="btn btn-secundario"
            onClick={onClose}
            disabled={eliminando}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn btn-primario"
            onClick={handleConfirmar}
            disabled={eliminando}
          >
            {eliminando ? 'Dando de baja...' : 'Confirmar baja'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default BajaUsuario
