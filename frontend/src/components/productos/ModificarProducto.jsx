import { useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarPorClave from '../BuscarPorClave.jsx'
import ProductoForm from './ProductoForm.jsx'
import { actualizarProducto, obtenerProducto } from '../../api/productos.js'

function ModificarProducto({ onClose, onExito }) {
  const [producto, setProducto] = useState(null)

  async function handleGuardar(datos) {
    const actualizado = await actualizarProducto(producto.codigo, datos)
    onExito(`Articulo ${actualizado.codigo} modificado`)
  }

  return (
    <Modal titulo="Modificar articulo" onClose={onClose}>
      {producto ? (
        <ProductoForm
          producto={producto}
          textoGuardar="Guardar cambios"
          onGuardar={handleGuardar}
          onCancelar={onClose}
        />
      ) : (
        <BuscarPorClave
          descripcion="Ingresa el codigo del articulo que queres modificar."
          etiqueta="Codigo del articulo"
          placeholder="Ej: FIL-0001"
          mensajeVacio="Ingresa el codigo del articulo"
          obtener={obtenerProducto}
          onEncontrado={setProducto}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default ModificarProducto
