import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarPorClave from '../BuscarPorClave.jsx'
import { eliminarProducto, obtenerProducto } from '../../api/productos.js'
import '../abm.css'

function ConfirmarBaja({ producto, onVolver, onConfirmar }) {
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
      await onConfirmar()
    } catch (err) {
      setError(err.message)
      setEliminando(false)
    }
  }

  return (
    <div className="abm-form">
      <p className="form-descripcion">Vas a dar de baja el siguiente articulo:</p>

      <dl className="abm-resumen">
        <dt>Codigo</dt>
        <dd className="mono">{producto.codigo}</dd>
        <dt>Nombre</dt>
        <dd>{producto.nombre}</dd>
        <dt>Proveedor</dt>
        <dd>{producto.proveedor?.nombre ?? 'Sin proveedor'}</dd>
        <dt>Stock actual</dt>
        <dd>{producto.stock}</dd>
      </dl>

      <p className="baja-advertencia">
        Esta accion no se puede deshacer. ¿Confirmas la baja?
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
        <button type="button" className="btn btn-primario" onClick={handleConfirmar} disabled={eliminando}>
          {eliminando ? 'Dando de baja...' : 'Confirmar baja'}
        </button>
      </div>
    </div>
  )
}

function BajaProducto({ onClose, onExito }) {
  const [producto, setProducto] = useState(null)

  async function handleConfirmar() {
    await eliminarProducto(producto.codigo)
    onExito(`Articulo ${producto.codigo} dado de baja`)
  }

  return (
    <Modal titulo="Baja de articulo" onClose={onClose}>
      {producto ? (
        <ConfirmarBaja
          producto={producto}
          onVolver={() => setProducto(null)}
          onConfirmar={handleConfirmar}
        />
      ) : (
        <BuscarPorClave
          descripcion="Ingresa el codigo del articulo que queres dar de baja."
          etiqueta="Codigo del articulo"
          placeholder="Ej: FIL-0001"
          mensajeVacio="Ingresa el codigo del articulo"
          obtener={obtenerProducto}
          onEncontrado={setProducto}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default BajaProducto
