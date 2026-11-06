import { useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarProducto from './BuscarProducto.jsx'
import ProductoForm from './ProductoForm.jsx'
import { actualizarProducto } from '../../api/productos.js'

function ModificarProducto({ onClose, onExito }) {
  const [producto, setProducto] = useState(null)

  async function handleGuardar(datos) {
    // Con el proveedor que tenia, por si el codigo se repite (regla 13).
    const actualizado = await actualizarProducto(producto.codigo, producto.proveedorId, datos)
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
        <BuscarProducto
          descripcion="Ingresa el codigo del articulo que queres modificar."
          onEncontrado={setProducto}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default ModificarProducto
