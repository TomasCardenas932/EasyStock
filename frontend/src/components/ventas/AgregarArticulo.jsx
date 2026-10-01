import { useState } from 'react'
import Modal from '../Modal.jsx'
import { formatoPrecio } from '../../pages/entidades.js'
import '../abm.css'

const CAMPO_CANTIDAD = 'agregar-cantidad'

// Confirmacion antes de sumar un articulo a la venta: muestra que se va a
// agregar y pide la cantidad (1 por defecto).
function AgregarArticulo({ articulo, onClose, onConfirmar }) {
  const [cantidad, setCantidad] = useState('1')
  const [error, setError] = useState(null)

  const numero = Number(cantidad)
  const cantidadValida = Number.isInteger(numero) && numero >= 1

  function handleSubmit(e) {
    e.preventDefault()
    if (!cantidadValida) {
      setError('Ingresa una cantidad entera mayor a 0')
      return
    }
    onConfirmar(numero)
  }

  // Si se mantiene apretado el Enter que abrio el cuadro, las repeticiones
  // llegan a este campo y confirmarian sin que el usuario elija la cantidad.
  function handleTecla(e) {
    if (e.key === 'Enter' && e.repeat) e.preventDefault()
  }

  return (
    <Modal titulo="Agregar articulo" onClose={onClose}>
      <form className="abm-form" onSubmit={handleSubmit} noValidate>
        <dl className="abm-resumen">
          <dt>Codigo</dt>
          <dd className="mono">{articulo.codigo}</dd>
          <dt>Nombre</dt>
          <dd>{articulo.nombre}</dd>
          <dt>Precio</dt>
          <dd>{formatoPrecio(articulo.precioPublico)}</dd>
          <dt>Subtotal</dt>
          <dd>
            {cantidadValida && articulo.precioPublico != null
              ? formatoPrecio(articulo.precioPublico * numero)
              : '-'}
          </dd>
        </dl>

        <div className="form-campo">
          <label htmlFor={CAMPO_CANTIDAD}>Cantidad</label>
          <input
            id={CAMPO_CANTIDAD}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={cantidad}
            onChange={(e) => {
              setCantidad(e.target.value)
              setError(null)
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={handleTecla}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${CAMPO_CANTIDAD}-error` : undefined}
            data-autofocus
          />
          {error && (
            <span id={`${CAMPO_CANTIDAD}-error`} className="form-error">
              {error}
            </span>
          )}
        </div>

        <div className="form-acciones">
          <button type="button" className="btn btn-secundario" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario">
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AgregarArticulo
