import { useEffect, useId, useRef, useState } from 'react'
import BuscarPorClave from '../BuscarPorClave.jsx'
import { obtenerProducto } from '../../api/productos.js'
import '../abm.css'

// Segundo paso cuando el codigo esta en mas de un proveedor: se elige de cual
// es el articulo y se lo busca con ese proveedor.
function ElegirProveedor({ codigo, candidatos, onEncontrado, onVolver }) {
  const [elegido, setElegido] = useState(String(candidatos[0].id))
  const [error, setError] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const selectRef = useRef(null)
  const id = useId()

  useEffect(() => {
    selectRef.current.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const candidato = candidatos.find((c) => String(c.id) === elegido)

    setBuscando(true)
    setError(null)
    try {
      onEncontrado(await obtenerProducto(codigo, candidato.proveedorId))
    } catch (err) {
      setError(err.message)
      setBuscando(false)
    }
  }

  return (
    <form className="abm-form" onSubmit={handleSubmit} noValidate>
      <p className="form-descripcion">
        El codigo <strong className="mono">{codigo}</strong> esta cargado en {candidatos.length}{' '}
        proveedores. Elegi de cual es el articulo.
      </p>

      <div className="form-campo">
        <label htmlFor={id}>Proveedor</label>
        <select
          ref={selectRef}
          id={id}
          value={elegido}
          onChange={(e) => setElegido(e.target.value)}
          disabled={buscando}
        >
          {candidatos.map((candidato) => (
            <option key={candidato.id} value={String(candidato.id)}>
              {candidato.proveedor ?? 'Sin proveedor'}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="form-error-general" role="alert">
          {error}
        </p>
      )}

      <div className="form-acciones">
        <button type="button" className="btn btn-secundario" onClick={onVolver} disabled={buscando}>
          Volver
        </button>
        <button type="submit" className="btn btn-primario" disabled={buscando}>
          {buscando ? 'Buscando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}

// Busca el articulo por codigo para modificarlo o darlo de baja. Si el codigo
// se repite entre proveedores, el backend no opera sobre ninguno y devuelve
// los candidatos (BRD, regla 13): se pide elegir el proveedor.
function BuscarProducto({ descripcion, onEncontrado, onCancelar }) {
  // { codigo, candidatos } mientras se elige el proveedor.
  const [repetido, setRepetido] = useState(null)

  async function obtener(codigo) {
    try {
      return await obtenerProducto(codigo)
    } catch (err) {
      if (!err.datos?.candidatos) throw err
      setRepetido({ codigo: codigo.trim(), candidatos: err.datos.candidatos })
      return null
    }
  }

  if (repetido) {
    return (
      <ElegirProveedor
        codigo={repetido.codigo}
        candidatos={repetido.candidatos}
        onEncontrado={onEncontrado}
        onVolver={() => setRepetido(null)}
      />
    )
  }

  return (
    <BuscarPorClave
      descripcion={descripcion}
      etiqueta="Codigo del articulo"
      placeholder="Ej: FIL-0001"
      mensajeVacio="Ingresa el codigo del articulo"
      obtener={obtener}
      onEncontrado={(producto) => producto && onEncontrado(producto)}
      onCancelar={onCancelar}
    />
  )
}

export default BuscarProducto
