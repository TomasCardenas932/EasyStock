import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../api/http.js'
import '../abm.css'

// Un proveedor solo guarda su nombre: el formulario pide ese unico dato.
const CAMPOS = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Distribuidora Moto Sur', span: 6 },
]

function valoresIniciales(proveedor) {
  return Object.fromEntries(
    CAMPOS.map(({ name }) => [name, proveedor?.[name] == null ? '' : String(proveedor[name])]),
  )
}

function validar(valores) {
  const errores = {}
  for (const campo of CAMPOS) {
    if (!valores[campo.name].trim() && !campo.opcional) {
      errores[campo.name] = `${campo.label} es obligatorio`
    }
  }
  return errores
}

function aDatos(valores) {
  return { nombre: valores.nombre.trim() }
}

// Formulario compartido por el alta y la modificacion de proveedores.
function ProveedorForm({ proveedor, textoGuardar, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(proveedor))
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
    <form ref={formRef} className="abm-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {CAMPOS.map((campo) => {
          const id = `proveedor-${campo.name}`
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
                autoComplete="off"
                placeholder={campo.placeholder}
                value={valores[campo.name]}
                onChange={handleChange}
                disabled={guardando}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                data-autofocus={campo.name === CAMPOS[0].name ? '' : undefined}
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

export default ProveedorForm
