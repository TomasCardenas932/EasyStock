import { useEffect, useId, useRef, useState } from 'react'
import './abm.css'

// Primer paso de la modificacion y la baja: ubicar el registro por su clave
// (el codigo en articulos, el nombre en proveedores).
function BuscarPorClave({
  descripcion,
  etiqueta,
  placeholder,
  mensajeVacio,
  obtener,
  onEncontrado,
  onCancelar,
}) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const inputRef = useRef(null)
  const id = useId()

  // Enfoca el campo tambien al volver desde la confirmacion de baja.
  useEffect(() => {
    inputRef.current.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!clave.trim()) {
      setError(mensajeVacio)
      return
    }

    setBuscando(true)
    setError(null)
    try {
      onEncontrado(await obtener(clave))
    } catch (err) {
      setError(err.message)
      setBuscando(false)
    }
  }

  return (
    <form className="abm-form" onSubmit={handleSubmit} noValidate>
      <p className="form-descripcion">{descripcion}</p>

      <div className="form-campo">
        <label htmlFor={id}>{etiqueta}</label>
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={clave}
          onChange={(e) => {
            setClave(e.target.value)
            setError(null)
          }}
          disabled={buscando}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          data-autofocus=""
        />
        {error && (
          <span id={`${id}-error`} className="form-error">
            {error}
          </span>
        )}
      </div>

      <div className="form-acciones">
        <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={buscando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primario" disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </form>
  )
}

export default BuscarPorClave
