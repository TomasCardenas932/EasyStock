import { useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import Topbar from '../components/Topbar.jsx'
import { useSesion } from '../sesion/SesionContext.js'
import '../components/abm.css'
import './Login.css'

const VACIO = { nombre: '', contrasena: '' }

function validar({ nombre, contrasena }) {
  const errores = {}
  if (!nombre.trim()) errores.nombre = 'Ingresa tu usuario'
  if (!contrasena) errores.contrasena = 'Ingresa tu contrasena'
  return errores
}

// SC000 - Inicio de sesion (FRD, reglas 14 y 15).
function Login() {
  const { usuario, iniciar } = useSesion()
  const location = useLocation()
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const contrasenaRef = useRef(null)

  // Con la sesion iniciada se va a la pantalla que se habia pedido, o al
  // Dashboard (FRD, CA-10).
  if (usuario) return <Navigate to={location.state?.desde ?? '/dashboard'} replace />

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

    setEnviando(true)
    try {
      await iniciar(valores.nombre.trim(), valores.contrasena)
    } catch (err) {
      // SC000.1: se avisa sin decir cual de los dos datos fallo y se borra la
      // contrasena para volver a escribirla.
      setErrorGeneral(err.message)
      setValores((prev) => ({ ...prev, contrasena: '' }))
      setEnviando(false)
      contrasenaRef.current?.focus()
    }
  }

  return (
    <div className="login">
      <Topbar />

      <main className="login-contenido">
        <section className="login-tarjeta" aria-labelledby="login-titulo">
          <header className="login-encabezado">
            <h1 id="login-titulo">Iniciar sesion</h1>
            <p>Ingresa con tu usuario y contrasena para ver el estado del inventario.</p>
          </header>

          <form className="abm-form login-form" onSubmit={handleSubmit} noValidate>
            {errorGeneral && (
              <p className="form-error-general" role="alert">
                {errorGeneral}
              </p>
            )}

            <div className="form-campo">
              <label htmlFor="login-nombre">Usuario</label>
              <input
                id="login-nombre"
                name="nombre"
                type="text"
                autoComplete="username"
                autoFocus
                value={valores.nombre}
                onChange={handleChange}
                aria-invalid={errores.nombre ? true : undefined}
                aria-describedby={errores.nombre ? 'login-nombre-error' : undefined}
              />
              {errores.nombre && (
                <span id="login-nombre-error" className="form-error">
                  {errores.nombre}
                </span>
              )}
            </div>

            <div className="form-campo">
              <label htmlFor="login-contrasena">Contrasena</label>
              <div className="login-contrasena">
                <input
                  ref={contrasenaRef}
                  id="login-contrasena"
                  name="contrasena"
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={valores.contrasena}
                  onChange={handleChange}
                  aria-invalid={errores.contrasena ? true : undefined}
                  aria-describedby={errores.contrasena ? 'login-contrasena-error' : undefined}
                />
                <button
                  type="button"
                  className="login-mostrar"
                  aria-controls="login-contrasena"
                  aria-pressed={mostrarContrasena}
                  onClick={() => setMostrarContrasena((actual) => !actual)}
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errores.contrasena && (
                <span id="login-contrasena-error" className="form-error">
                  {errores.contrasena}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primario login-ingresar" disabled={enviando}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <footer className="login-pie">
            Si olvidaste tu contrasena, pedile al gerente que la restablezca.
          </footer>
        </section>
      </main>
    </div>
  )
}

export default Login
