import { useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarPorCodigo from './BuscarPorCodigo.jsx'
import ProductoForm from './ProductoForm.jsx'
import { actualizarProducto } from '../../api/productos.js'

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
        <BuscarPorCodigo
          descripcion="Ingresa el codigo del articulo que queres modificar."
          onEncontrado={setProducto}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default ModificarProducto
