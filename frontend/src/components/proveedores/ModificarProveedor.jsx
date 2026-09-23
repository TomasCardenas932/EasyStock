import { useState } from 'react'
import Modal from '../Modal.jsx'
import BuscarPorClave from '../BuscarPorClave.jsx'
import ProveedorForm from './ProveedorForm.jsx'
import { actualizarProveedor, obtenerProveedor } from '../../api/proveedores.js'

function ModificarProveedor({ onClose, onExito }) {
  const [proveedor, setProveedor] = useState(null)

  async function handleGuardar(datos) {
    const actualizado = await actualizarProveedor(proveedor.nombre, datos)
    onExito(`Proveedor ${actualizado.nombre} modificado`)
  }

  return (
    <Modal titulo="Modificar proveedor" onClose={onClose}>
      {proveedor ? (
        <ProveedorForm
          proveedor={proveedor}
          textoGuardar="Guardar cambios"
          onGuardar={handleGuardar}
          onCancelar={onClose}
        />
      ) : (
        <BuscarPorClave
          descripcion="Ingresa el nombre del proveedor que queres modificar."
          etiqueta="Nombre del proveedor"
          placeholder="Ej: Distribuidora Moto Sur"
          mensajeVacio="Ingresa el nombre del proveedor"
          obtener={obtenerProveedor}
          onEncontrado={setProveedor}
          onCancelar={onClose}
        />
      )}
    </Modal>
  )
}

export default ModificarProveedor
