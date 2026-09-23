import AltaProducto from '../components/productos/AltaProducto.jsx'
import ModificarProducto from '../components/productos/ModificarProducto.jsx'
import BajaProducto from '../components/productos/BajaProducto.jsx'
import AltaProveedor from '../components/proveedores/AltaProveedor.jsx'
import ModificarProveedor from '../components/proveedores/ModificarProveedor.jsx'
import BajaProveedor from '../components/proveedores/BajaProveedor.jsx'
import { listarProductos } from '../api/productos.js'
import { listarProveedores } from '../api/proveedores.js'

const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

// Cada entidad describe como listarla, que columnas muestra y que modales abren
// los botones de ABM. La pagina es la misma para todas: alcanza con agregar una
// entrada mas para sumar otra tabla.
const ENTIDADES = [
  {
    clave: 'productos',
    etiqueta: 'Articulos',
    titulo: 'Articulos',
    singular: 'articulo',
    plural: 'articulos',
    listar: listarProductos,
    buscador: {
      etiqueta: 'Buscar articulos',
      placeholder: 'Buscar por codigo o nombre',
    },
    columnas: [
      { titulo: 'Codigo', clase: 'mono', valor: (a) => a.codigo },
      { titulo: 'Nombre', valor: (a) => a.nombre },
      { titulo: 'Stock', clase: 'num', valor: (a) => a.stock },
      { titulo: 'Costo', clase: 'num', valor: (a) => formatoPesos.format(a.costo) },
      {
        titulo: 'Precio publico',
        clase: 'num',
        valor: (a) => (a.precioPublico == null ? '-' : formatoPesos.format(a.precioPublico)),
      },
      { titulo: 'Proveedor', valor: (a) => a.proveedor?.nombre ?? '-' },
    ],
    modales: { alta: AltaProducto, modificar: ModificarProducto, baja: BajaProducto },
  },
  {
    clave: 'proveedores',
    etiqueta: 'Proveedores',
    titulo: 'Proveedores',
    singular: 'proveedor',
    plural: 'proveedores',
    listar: listarProveedores,
    buscador: {
      etiqueta: 'Buscar proveedores',
      placeholder: 'Buscar por nombre',
    },
    columnas: [
      { titulo: 'Nombre', valor: (p) => p.nombre },
      { titulo: 'Articulos', clase: 'num', valor: (p) => p.cantidadArticulos },
    ],
    modales: { alta: AltaProveedor, modificar: ModificarProveedor, baja: BajaProveedor },
  },
]

export default ENTIDADES
