import { useEffect, useId, useRef } from 'react'
import './Modal.css'


function Modal({ titulo, onClose, children }) {
  const ref = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    const dialog = ref.current
    const focoPrevio = document.activeElement
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
    return () => {
      dialog.close()
      focoPrevio?.focus?.()
    }
  }, [])

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog ref={ref} className="modal" aria-labelledby={tituloId} onCancel={handleCancel}>
      <header className="modal-header">
        <h2 id={tituloId}>{titulo}</h2>
        <button type="button" className="modal-cerrar" aria-label="Cerrar" onClick={onClose}>
          &times;
        </button>
      </header>
      <div className="modal-cuerpo">{children}</div>
    </dialog>
  )
}

export default Modal
