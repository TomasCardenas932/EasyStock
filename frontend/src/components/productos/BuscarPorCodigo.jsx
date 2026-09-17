import { useEffect, useRef, useState } from 'react'
import { obtenerProducto } from '../../api/productos.js'
import './productos.css'

// Primer paso de la modificacion y la baja: ubicar el producto por su codigo.
function BuscarPorCodigo({ descripcion, onEncontrado, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const inputRef = useRef(null)

  // Enfoca el campo tambien al volver desde la confirmacion de baja.
  useEffect(() => {
    inputRef.current.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!codigo.trim()) {
      setError('Ingresa el codigo del producto')
      return
    }

    setBuscando(true)
    setError(null)
    try {
      onEncontrado(await obtenerProducto(codigo))
    } catch (err) {
      setError(err.message)
      setBuscando(false)
    }
  }

  return (
    <form className="producto-form" onSubmit={handleSubmit} noValidate>
      <p className="form-descripcion">{descripcion}</p>

      <div className="form-campo">
        <label htmlFor="buscar-codigo">Codigo del producto</label>
        <input
          ref={inputRef}
          id="buscar-codigo"
          type="text"
          autoComplete="off"
          placeholder="Ej: FIL-0001"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value)
            setError(null)
          }}
          disabled={buscando}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'buscar-codigo-error' : undefined}
          data-autofocus=""
        />
        {error && (
          <span id="buscar-codigo-error" className="form-error">
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

export default BuscarPorCodigo
