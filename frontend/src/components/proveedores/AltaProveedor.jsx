import Modal from '../Modal.jsx'
import ProveedorForm from './ProveedorForm.jsx'
import { crearProveedor } from '../../api/proveedores.js'

function AltaProveedor({ onClose, onExito }) {
  async function handleGuardar(datos) {
    const creado = await crearProveedor(datos)
    onExito(`Proveedor ${creado.nombre} dado de alta`)
  }

  return (
    <Modal titulo="Alta de proveedor" onClose={onClose}>
      <ProveedorForm textoGuardar="Dar de alta" onGuardar={handleGuardar} onCancelar={onClose} />
    </Modal>
  )
}

export default AltaProveedor
