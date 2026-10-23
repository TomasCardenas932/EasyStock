import { useEffect, useId, useRef, useState } from 'react'
import Modal from '../Modal.jsx'
import { listarProductos } from '../../api/productos.js'
import { registrarEntrada } from '../../api/movimientos.js'
import { ApiError } from '../../api/http.js'
import '../abm.css'

// Campos del backend que corresponden a cada campo del formulario.
const CAMPOS_API = { productoId: 'articulo', cantidad: 'cantidad', referencia: 'referencia' }

// El proveedor distingue articulos con el mismo codigo.
const etiqueta = (producto) =>
  `${producto.codigo} - ${producto.nombre}` +
  (producto.proveedor ? ` (${producto.proveedor.nombre})` : '')

// Toma el articulo elegido de la lista o, si se escribio solo el codigo, el
// unico articulo que lo tiene.
function buscarArticulo(productos, texto) {
  const buscado = texto.trim()
  const porEtiqueta = productos.find((producto) => etiqueta(producto) === buscado)
  if (porEtiqueta) return porEtiqueta
  const porCodigo = productos.filter(
    (producto) => producto.codigo.toLowerCase() === buscado.toLowerCase(),
  )
  return porCodigo.length === 1 ? porCodigo[0] : null
}

// Reglas Q1 y Q2 del FRD: con el stock en el umbral o por debajo, se sugiere
// llevarlo al doble del umbral.
function ayudaArticulo(producto) {
  const { stock, umbralMinimo } = producto
  if (umbralMinimo == null) return 'Sin umbral minimo asignado.'
  const sugerida = 2 * umbralMinimo - stock
  return stock <= umbralMinimo && sugerida > 0
    ? `Umbral minimo ${umbralMinimo}. Cantidad sugerida para reponer: ${sugerida}.`
    : `Umbral minimo ${umbralMinimo}.`
}

const unidades = (cantidad) => (cantidad === 1 ? '1 unidad' : `${cantidad} unidades`)

const AYUDA_REFERENCIA =
  '"Registrar y cargar otro" conserva la referencia para seguir con el resto de la factura.'

// FRD, SC004.1: suma unidades al stock de un articulo. "Registrar y cargar
// otro" deja el cuadro abierto y conserva la referencia, para seguir con el
// resto de la factura o el remito.
function EntradaStock({ onClose, onRegistrada }) {
  // null mientras se carga la lista de articulos.
  const [productos, setProductos] = useState(null)
  const [errorProductos, setErrorProductos] = useState(null)
  const [texto, setTexto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [referencia, setReferencia] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  // Ultima entrada registrada sin cerrar el cuadro: { mensaje }. Un objeto
  // nuevo por entrada, para que el efecto de abajo corra cada vez.
  const [registrada, setRegistrada] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const articuloRef = useRef(null)
  const id = useId()

  useEffect(() => {
    const controller = new AbortController()

    async function cargarProductos() {
      try {
        setProductos(await listarProductos('', { signal: controller.signal }))
      } catch (err) {
        if (err.name === 'AbortError') return
        setProductos([])
        setErrorProductos('No se pudo cargar la lista de articulos.')
      }
    }

    cargarProductos()
    return () => controller.abort()
  }, [])

  // Despues de "Registrar y cargar otro" se sigue por el articulo. Corre una
  // vez habilitados los campos: deshabilitados no toman el foco.
  useEffect(() => {
    if (registrada) articuloRef.current.focus()
  }, [registrada])

  const articulo = productos ? buscarArticulo(productos, texto) : null
  const cantidadValida = /^\d+$/.test(cantidad.trim()) && Number(cantidad) >= 1

  // Texto debajo de cada campo: el error si hay, si no la ayuda.
  const notas = {
    articulo: errores.articulo ?? errorProductos ?? (articulo && ayudaArticulo(articulo)),
    cantidad: errores.cantidad,
    referencia: errores.referencia ?? AYUDA_REFERENCIA,
  }
  const esError = (nombre) =>
    Boolean(errores[nombre] || (nombre === 'articulo' && errorProductos))

  function cambiar(setter, campo) {
    return (e) => {
      setter(e.target.value)
      setErrores((prev) => ({ ...prev, [campo]: undefined }))
    }
  }

  function validar() {
    const nuevos = {}
    if (!texto.trim()) nuevos.articulo = 'Elegi el articulo al que se le suma el stock'
    else if (!articulo) nuevos.articulo = 'Elegi un articulo de la lista'
    if (!cantidadValida) nuevos.cantidad = 'Ingresa una cantidad entera mayor a 0'
    return nuevos
  }

  async function registrar(seguir) {
    setErrorGeneral(null)
    setRegistrada(null)

    const locales = validar()
    setErrores(locales)
    if (Object.keys(locales).length > 0) return

    setGuardando(true)
    try {
      const { movimiento, producto } = await registrarEntrada({
        productoId: articulo.id,
        cantidad: Number(cantidad),
        referencia,
      })
      const mensaje =
        `Entrada registrada: se sumaron ${unidades(movimiento.cantidad)} a ${producto.codigo} ` +
        `(stock ${producto.stock - movimiento.cantidad} → ${producto.stock}).`
      onRegistrada(mensaje)

      if (!seguir) {
        onClose()
        return
      }
      setProductos((actuales) =>
        actuales.map((actual) =>
          actual.id === producto.id ? { ...actual, stock: producto.stock } : actual,
        ),
      )
      setTexto('')
      setCantidad('')
      setRegistrada({ mensaje })
      setGuardando(false)
    } catch (err) {
      const deCampo = {}
      if (err instanceof ApiError) {
        for (const { campo, mensaje } of err.detalles) {
          if (CAMPOS_API[campo]) deCampo[CAMPOS_API[campo]] ??= mensaje
        }
      }
      setErrores(deCampo)
      if (Object.keys(deCampo).length === 0) setErrorGeneral(err.message)
      setGuardando(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    registrar(false)
  }

  // Atributos que unen cada campo con su nota.
  function campo(nombre) {
    return {
      id: `${id}-${nombre}`,
      'aria-invalid': errores[nombre] ? true : undefined,
      'aria-describedby': notas[nombre] ? `${id}-${nombre}-nota` : undefined,
    }
  }

  function nota(nombre) {
    if (!notas[nombre]) return null
    return (
      <span id={`${id}-${nombre}-nota`} className={esError(nombre) ? 'form-error' : 'form-ayuda'}>
        {notas[nombre]}
      </span>
    )
  }

  return (
    <Modal titulo="Entrada de stock" onClose={onClose}>
      <form className="abm-form" onSubmit={handleSubmit} noValidate>
        <p className="form-descripcion">
          Suma unidades al stock de un articulo, por ejemplo al recibir una factura o un remito.
          Queda registrada en Movimientos.
        </p>

        {registrada && (
          <p className="form-exito" role="status">
            {registrada.mensaje}
          </p>
        )}

        <div className="form-grid">
          <div className="form-campo span-6">
            <label htmlFor={`${id}-articulo`}>Articulo</label>
            <input
              {...campo('articulo')}
              ref={articuloRef}
              type="text"
              list={`${id}-productos`}
              autoComplete="off"
              placeholder={productos ? 'Codigo o nombre del articulo' : 'Cargando articulos...'}
              value={texto}
              onChange={cambiar(setTexto, 'articulo')}
              disabled={guardando}
              data-autofocus
            />
            <datalist id={`${id}-productos`}>
              {(productos ?? []).map((producto) => (
                <option key={producto.id} value={etiqueta(producto)} />
              ))}
            </datalist>
            {nota('articulo')}
          </div>

          <div className="form-campo span-2">
            <label htmlFor={`${id}-actual`}>Stock actual</label>
            <input id={`${id}-actual`} type="text" value={articulo?.stock ?? ''} disabled />
          </div>

          <div className="form-campo span-2">
            <label htmlFor={`${id}-cantidad`}>Cantidad a sumar</label>
            <input
              {...campo('cantidad')}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={cantidad}
              onChange={cambiar(setCantidad, 'cantidad')}
              disabled={guardando}
            />
            {nota('cantidad')}
          </div>

          <div className="form-campo span-2">
            <label htmlFor={`${id}-resultante`}>Stock resultante</label>
            <input
              id={`${id}-resultante`}
              type="text"
              value={articulo && cantidadValida ? articulo.stock + Number(cantidad) : ''}
              disabled
            />
          </div>

          <div className="form-campo span-6">
            <label htmlFor={`${id}-referencia`}>
              Referencia <span className="form-opcional">(opcional)</span>
            </label>
            <input
              {...campo('referencia')}
              type="text"
              autoComplete="off"
              maxLength={100}
              placeholder="Factura o remito, ej: Fact. A 0003-00004512"
              value={referencia}
              onChange={cambiar(setReferencia, 'referencia')}
              disabled={guardando}
            />
            {nota('referencia')}
          </div>
        </div>

        {errorGeneral && (
          <p className="form-error-general" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="form-acciones">
          <button type="button" className="btn btn-secundario" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => registrar(true)}
            disabled={guardando}
          >
            Registrar y cargar otro
          </button>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Registrando...' : 'Registrar entrada'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EntradaStock
