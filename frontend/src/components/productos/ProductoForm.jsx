import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../api/http.js'
import { listarProveedores } from '../../api/proveedores.js'
import '../abm.css'

const CAMPOS = [
  { name: 'codigo', label: 'Codigo', placeholder: 'Ej: FIL-0002', span: 2 },
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Filtro de aire Honda Wave 110', span: 4 },
  { name: 'stock', label: 'Stock', placeholder: 'Ej: 12', numerico: true, span: 2 },
  { name: 'costo', label: 'Costo ($)', placeholder: 'Ej: 4500', numerico: true, span: 2 },
  { name: 'precioPublico', label: 'Precio publico ($)', placeholder: 'Ej: 7800', numerico: true, span: 2 },
  { name: 'proveedorId', label: 'Proveedor', seleccion: true, opcional: true, span: 2 },
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
    proveedorId: valores.proveedorId === '' ? null : Number(valores.proveedorId),
  }
}

// Formulario compartido por el alta y la modificacion de productos.
function ProductoForm({ producto, textoGuardar, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(producto))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)
  // null mientras se cargan: el selector queda deshabilitado hasta tener lista.
  const [proveedores, setProveedores] = useState(null)
  const [errorProveedores, setErrorProveedores] = useState(null)
  const formRef = useRef(null)

  // Enfoca el primer campo tambien cuando el formulario aparece en un segundo paso.
  useEffect(() => {
    formRef.current.querySelector('[data-autofocus]')?.focus()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function cargarProveedores() {
      try {
        setProveedores(await listarProveedores('', { signal: controller.signal }))
      } catch (err) {
        if (err.name === 'AbortError') return
        // El proveedor es opcional: el resto del formulario sigue usable.
        setProveedores([])
        setErrorProveedores('No se pudo cargar la lista de proveedores.')
      }
    }

    cargarProveedores()
    return () => controller.abort()
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

  function renderCampo(campo, id, error) {
    const comunes = {
      id,
      name: campo.name,
      value: valores[campo.name],
      onChange: handleChange,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
    }

    if (campo.seleccion) {
      const cargando = proveedores === null
      return (
        <select {...comunes} disabled={guardando || cargando}>
          <option value="">{cargando ? 'Cargando proveedores...' : 'Sin proveedor'}</option>
          {(proveedores ?? []).map((proveedor) => (
            <option key={proveedor.id} value={String(proveedor.id)}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        {...comunes}
        type="text"
        inputMode={campo.numerico ? 'numeric' : undefined}
        autoComplete="off"
        placeholder={campo.placeholder}
        disabled={guardando}
        data-autofocus={campo.name === CAMPOS[0].name ? '' : undefined}
      />
    )
  }

  return (
    <form ref={formRef} className="abm-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {CAMPOS.map((campo) => {
          const id = `producto-${campo.name}`
          const error = errores[campo.name]
          const aviso = campo.seleccion ? errorProveedores : null
          return (
            <div key={campo.name} className={`form-campo span-${campo.span}`}>
              <label htmlFor={id}>
                {campo.label}
                {campo.opcional && <span className="form-opcional"> (opcional)</span>}
              </label>
              {renderCampo(campo, id, error)}
              {(error || aviso) && (
                <span id={`${id}-error`} className="form-error">
                  {error ?? aviso}
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
