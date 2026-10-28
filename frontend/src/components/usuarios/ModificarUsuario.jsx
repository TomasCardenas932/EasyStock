import Modal from '../Modal.jsx'
import UsuarioForm from './UsuarioForm.jsx'
import { actualizarUsuario } from '../../api/usuarios.js'

// El usuario llega elegido desde su fila del listado. propio: es el de la
// sesion, que no puede cambiarse el rol.
function ModificarUsuario({ usuario, propio, onClose, onExito }) {
  async function handleGuardar(datos) {
    const actualizado = await actualizarUsuario(usuario.id, datos)
    onExito(`Usuario ${actualizado.nombre} ${actualizado.apellido} modificado`)
  }

  return (
    <Modal titulo="Modificar usuario" onClose={onClose}>
      <UsuarioForm
        usuario={usuario}
        rolFijo={propio}
        textoGuardar="Guardar cambios"
        onGuardar={handleGuardar}
        onCancelar={onClose}
      />
    </Modal>
  )
}

export default ModificarUsuario
