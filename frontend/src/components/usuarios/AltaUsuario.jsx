import Modal from '../Modal.jsx'
import UsuarioForm from './UsuarioForm.jsx'
import { crearUsuario } from '../../api/usuarios.js'

function AltaUsuario({ onClose, onExito }) {
  async function handleGuardar(datos) {
    const creado = await crearUsuario(datos)
    onExito(`Usuario ${creado.nombre} ${creado.apellido} dado de alta`)
  }

  return (
    <Modal titulo="Alta de usuario" onClose={onClose}>
      <UsuarioForm textoGuardar="Dar de alta" onGuardar={handleGuardar} onCancelar={onClose} />
    </Modal>
  )
}

export default AltaUsuario
