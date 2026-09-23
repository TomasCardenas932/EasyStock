import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarPorClave from '../BuscarPorClave.jsx'
import { eliminarProveedor, obtenerProveedor } from '../../api/proveedores.js'
import '../abm.css'

function ConfirmarBaja({ proveedor, onVolver, onConfirmar }) {
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState(null)
  const volverRef = useRef(null)

  // El backend rechaza la baja si quedan articulos: se avisa antes de intentarla.
  const conArticulos = proveedor.cantidadArticulos > 0

  // Foco en "Volver": la opcion segura ante una accion irreversible.
  useEffect(() => {
    volverRef.current.focus()
  }, [])

  async function handleConfirmar() {
    setEliminando(true)
    setError(null)
    try {
      await onConfirmar()
    } catch (err) {
      setError(err.message)
      setEliminando(false)
    }
  }

  return (
    <div className="abm-form">
      <p className="form-descripcion">Vas a dar de baja el siguiente proveedor:</p>

      <dl className="abm-resumen">
        <dt>Nombre</dt>
        <dd>{proveedor.nombre}</dd>
        <dt>Articulos asociados</dt>
        <dd>{proveedor.cantidadArticulos}</dd>
      </dl>

      <p className="baja-advertencia">
        {conArticulos
          ? 'Este proveedor todavia tiene articulos cargados. Reasignalos o dalos de baja antes de eliminarlo.'
          : 'Esta accion no se puede deshacer. ¿Confirmas la baja?'}
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
          onClick={onVolver}
          disabled={eliminando}
        >
          Volver
        </button>
        <button
          type="button"
          className="btn btn-primario"
          onClick={handleConfirmar}
          disabled={eliminando || conArticulos}
        >
          {eliminando ? 'Dando de baja...' : 'Confirmar baja'}
        </button>
      </div>
    </div>
  )
}

function BajaProveedor({ onClose, onExito }) {
  const [proveedor, setProveedor] = useState(null)

  async function handleConfirmar() {
    await eliminarProveedor(proveedor.nombre)
    onExito(`Proveedor ${proveedor.nombre} dado de baja`)
  }

  return (
    <Modal titulo="Baja de proveedor" onClose={onClose}>
      {proveedor ? (
        <ConfirmarBaja
          proveedor={proveedor}
          onVolver={() => setProveedor(null)}
          onConfirmar={handleConfirmar}
        />
      ) : (
        <BuscarPorClave
          descripcion="Ingresa el nombre del proveedor que queres dar de baja."
          etiqueta="Nombre del proveedor"
          placeholder="Ej: Distribuidora Moto Sur"
          mensajeVacio="Ingresa el nombre del proveedor"
          obtener={obtenerProveedor}
          onEncontrado={setProveedor}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default BajaProveedor
