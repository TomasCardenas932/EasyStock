import Modal from '../Modal.jsx'
import ProductoForm from './ProductoForm.jsx'
import { crearProducto } from '../../api/productos.js'

function AltaProducto({ onClose, onExito }) {
  async function handleGuardar(datos) {
    const creado = await crearProducto(datos)
    onExito(`Articulo ${creado.codigo} dado de alta`)
  }

  return (
    <Modal titulo="Alta de articulo" onClose={onClose}>
      <ProductoForm textoGuardar="Dar de alta" onGuardar={handleGuardar} onCancelar={onClose} />
    </Modal>
  )
}

export default AltaProducto
