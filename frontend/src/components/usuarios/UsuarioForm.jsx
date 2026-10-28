import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../api/http.js'
import { listarRoles } from '../../api/roles.js'
import '../abm.css'

// Mismo formato que valida el backend: codigo de area de 2 digitos, un
// espacio y 8 digitos de numero.
const FORMATO_TELEFONO = /^\d{2} \d{8}$/

const CAMPOS = ['nombre', 'apellido', 'telefono', 'rolId', 'contrasena']

function valoresIniciales(usuario) {
  return {
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    telefono: usuario?.telefono ?? '',
    rolId: usuario?.rolId == null ? '' : String(usuario.rolId),
    contrasena: '',
  }
}

// En la modificacion la contrasena es opcional: vacia, se conserva.
function validar(valores, { contrasenaOpcional }) {
  const errores = {}
  if (!valores.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  if (!valores.apellido.trim()) errores.apellido = 'El apellido es obligatorio'
  if (!FORMATO_TELEFONO.test(valores.telefono.trim())) {
    errores.telefono = 'El telefono debe tener el formato "11 12345678"'
  }
  if (!contrasenaOpcional && !valores.contrasena) errores.contrasena = 'La contrasena es obligatoria'
  return errores
}

// La contrasena va solo si se escribio una, y el rol solo si se puede cambiar.
// Sin rol viaja null.
function aDatos(valores, { conRol }) {
  return {
    nombre: valores.nombre.trim(),
    apellido: valores.apellido.trim(),
    telefono: valores.telefono.trim(),
    ...(conRol && { rolId: valores.rolId === '' ? null : Number(valores.rolId) }),
    ...(valores.contrasena && { contrasena: valores.contrasena }),
  }
}

// Formulario compartido por el alta y la modificacion de usuarios. rolFijo:
// el usuario es el de la sesion, que no puede cambiarse el rol.
function UsuarioForm({ usuario, rolFijo = false, textoGuardar, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(usuario))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)
  // null mientras se cargan: el selector queda deshabilitado hasta tener lista.
  const [roles, setRoles] = useState(null)
  const [errorRoles, setErrorRoles] = useState(null)
  const formRef = useRef(null)
  const contrasenaOpcional = Boolean(usuario)

  useEffect(() => {
    formRef.current.querySelector('[data-autofocus]')?.focus()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function cargarRoles() {
      try {
        setRoles(await listarRoles({ signal: controller.signal }))
      } catch (err) {
        if (err.name === 'AbortError') return
        setRoles([])
        setErrorRoles('No se pudo cargar la lista de roles.')
      }
    }

    cargarRoles()
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

    const erroresLocales = validar(valores, { contrasenaOpcional })
    setErrores(erroresLocales)
    if (Object.keys(erroresLocales).length > 0) return

    setGuardando(true)
    try {
      await onGuardar(aDatos(valores, { conRol: !rolFijo }))
    } catch (err) {
      const deCampo = {}
      if (err instanceof ApiError) {
        for (const { campo, mensaje } of err.detalles) {
          if (CAMPOS.includes(campo)) deCampo[campo] ??= mensaje
        }
      }
      setErrores(deCampo)
      if (Object.keys(deCampo).length === 0) setErrorGeneral(err.message)
      setGuardando(false)
    }
  }

  // Atributos comunes de cada campo, con su nota (error o ayuda) debajo.
  function campo(name, ayuda) {
    return {
      id: `usuario-${name}`,
      name,
      value: valores[name],
      onChange: handleChange,
      'aria-invalid': errores[name] ? true : undefined,
      'aria-describedby': errores[name] || ayuda ? `usuario-${name}-nota` : undefined,
    }
  }

  function nota(name, ayuda) {
    const texto = errores[name] ?? ayuda
    if (!texto) return null
    return (
      <span id={`usuario-${name}-nota`} className={errores[name] ? 'form-error' : 'form-ayuda'}>
        {texto}
      </span>
    )
  }

  const cargandoRoles = roles === null
  const ayudaRol = rolFijo ? 'No podes cambiar tu propio rol.' : errorRoles
  const ayudaContrasena = contrasenaOpcional ? 'Dejala vacia para no cambiarla.' : null

  return (
    <form ref={formRef} className="abm-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-campo span-2">
          <label htmlFor="usuario-nombre">Nombre</label>
          <input
            {...campo('nombre')}
            type="text"
            autoComplete="off"
            placeholder="Ej: Martina"
            disabled={guardando}
            data-autofocus
          />
          {nota('nombre')}
        </div>

        <div className="form-campo span-2">
          <label htmlFor="usuario-apellido">Apellido</label>
          <input
            {...campo('apellido')}
            type="text"
            autoComplete="off"
            placeholder="Ej: Gomez"
            disabled={guardando}
          />
          {nota('apellido')}
        </div>

        <div className="form-campo span-2">
          <label htmlFor="usuario-telefono">Telefono</label>
          <input
            {...campo('telefono')}
            type="text"
            inputMode="tel"
            autoComplete="off"
            placeholder="Ej: 11 12345678"
            disabled={guardando}
          />
          {nota('telefono')}
        </div>

        <div className="form-campo span-2">
          <label htmlFor="usuario-rolId">
            Rol <span className="form-opcional">(opcional)</span>
          </label>
          <select {...campo('rolId', ayudaRol)} disabled={guardando || cargandoRoles || rolFijo}>
            <option value="">{cargandoRoles ? 'Cargando roles...' : 'Sin rol'}</option>
            {(roles ?? []).map((rol) => (
              <option key={rol.id} value={String(rol.id)}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {nota('rolId', ayudaRol)}
        </div>

        <div className="form-campo span-4">
          <label htmlFor="usuario-contrasena">
            {contrasenaOpcional ? 'Nueva contrasena' : 'Contrasena'}
            {contrasenaOpcional && <span className="form-opcional"> (opcional)</span>}
          </label>
          <input
            {...campo('contrasena', ayudaContrasena)}
            type="password"
            autoComplete="new-password"
            disabled={guardando}
          />
          {nota('contrasena', ayudaContrasena)}
        </div>
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

export default UsuarioForm
