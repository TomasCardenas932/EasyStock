import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../api/productos.js'
import './productos.css'

const CAMPOS = [
  { name: 'codigo', label: 'Codigo', placeholder: 'Ej: FIL-0002', span: 2 },
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Filtro de aire Honda Wave 110', span: 4 },
  { name: 'stock', label: 'Stock', placeholder: 'Ej: 12', numerico: true, span: 2 },
  { name: 'costo', label: 'Costo ($)', placeholder: 'Ej: 4500', numerico: true, span: 2 },
  { name: 'precioPublico', label: 'Precio publico ($)', placeholder: 'Ej: 7800', numerico: true, span: 2 },
  { name: 'proveedor', label: 'Proveedor (N°)', placeholder: 'Ej: 2', numerico: true, opcional: true, span: 2 },
]

const ENTERO_NO_NEGATIVO = /^\d+$/

function valoresIniciales(producto) {
  return Object.fromEntries(
    CAMPOS.map(({ name }) => [name, producto?.[name] == null ? '' : String(producto[name])]),
  )
}

function validar(valores) {
  const errores = {}
  for (const campo of CAMPOS) {
    const valor = valores[campo.name].trim()
    if (!valor) {
      if (!campo.opcional) errores[campo.name] = `${campo.label} es obligatorio`
    } else if (campo.numerico && !ENTERO_NO_NEGATIVO.test(valor)) {
      errores[campo.name] = 'Ingresa un numero entero mayor o igual a 0'
    }
  }
  return errores
}

function aDatos(valores) {
  return {
    codigo: valores.codigo.trim(),
    nombre: valores.nombre.trim(),
    stock: Number(valores.stock),
    costo: Number(valores.costo),
    precioPublico: Number(valores.precioPublico),
    proveedor: valores.proveedor.trim() === '' ? null : Number(valores.proveedor),
  }
}

// Formulario compartido por el alta y la modificacion de productos.
function ProductoForm({ producto, textoGuardar, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(producto))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const formRef = useRef(null)

  // Enfoca el primer campo tambien cuando el formulario aparece en un segundo paso.
  useEffect(() => {
    formRef.current.querySelector('[data-autofocus]')?.focus()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValores((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorGeneral(null)

    const erroresLocales = validar(valores)
    setErrores(erroresLocales)
    if (Object.keys(erroresLocales).length > 0) return

    setGuardando(true)
    try {
      await onGuardar(aDatos(valores))
    } catch (err) {
      const deCampo = {}
      if (err instanceof ApiError) {
        for (const { campo, mensaje } of err.detalles) {
          if (campo in valores) deCampo[campo] ??= mensaje
        }
      }
      setErrores(deCampo)
      if (Object.keys(deCampo).length === 0) setErrorGeneral(err.message)
      setGuardando(false)
    }
  }

  return (
    <form ref={formRef} className="producto-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {CAMPOS.map((campo, i) => {
          const id = `producto-${campo.name}`
          const error = errores[campo.name]
          return (
            <div key={campo.name} className={`form-campo span-${campo.span}`}>
              <label htmlFor={id}>
                {campo.label}
                {campo.opcional && <span className="form-opcional"> (opcional)</span>}
              </label>
              <input
                id={id}
                name={campo.name}
                type="text"
                inputMode={campo.numerico ? 'numeric' : undefined}
                autoComplete="off"
                placeholder={campo.placeholder}
                value={valores[campo.name]}
                onChange={handleChange}
                disabled={guardando}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                data-autofocus={i === 0 ? '' : undefined}
              />
              {error && (
                <span id={`${id}-error`} className="form-error">
                  {error}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {errorGeneral && (
        <p className="form-error-general" role="alert">
          {errorGeneral}
        </p>
      )}

      <div className="form-acciones">
        <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : textoGuardar}
        </button>
      </div>
    </form>
  )
}

export default ProductoForm
