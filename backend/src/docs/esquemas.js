// Esquemas de los datos que entran y salen de la API, para la documentacion
// de Swagger (docs/openapi.js). Siguen a los esquemas Joi de schemas/ y a los
// modelos de models/.

const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` });
const lista = (nombre) => ({ type: 'array', items: ref(nombre) });

const entero = (description) => ({ type: 'integer', description });
const enteroOpcional = (description) => ({ type: 'integer', nullable: true, description });
const texto = (description) => ({ type: 'string', description });
const fecha = (description) => ({ type: 'string', format: 'date-time', description });

const FECHAS = {
  createdAt: fecha('Alta del registro'),
  updatedAt: fecha('Ultima modificacion'),
};

const ESQUEMAS = {
  Error: {
    type: 'object',
    required: ['error'],
    properties: {
      error: texto('Mensaje para mostrarle al usuario'),
      detalles: {
        type: 'array',
        description: 'Un mensaje por cada campo con problemas',
        items: {
          type: 'object',
          properties: { campo: texto('Campo del cuerpo o del parametro'), mensaje: texto() },
        },
      },
      candidatos: {
        type: 'array',
        description: 'Articulos con el codigo pedido, cuando se repite entre proveedores (regla 13)',
        items: {
          type: 'object',
          properties: {
            id: entero(),
            proveedorId: enteroOpcional(),
            proveedor: { type: 'string', nullable: true },
          },
        },
      },
    },
  },

  Credenciales: {
    type: 'object',
    required: ['email', 'contrasena'],
    properties: {
      email: { type: 'string', format: 'email', description: 'Sin distinguir mayusculas' },
      contrasena: { type: 'string', format: 'password' },
    },
  },
  Sesion: {
    type: 'object',
    properties: {
      token: texto('Token para el encabezado "Authorization: Bearer <token>". Vence a las 8 horas.'),
      usuario: ref('UsuarioDeLaSesion'),
    },
  },
  UsuarioDeLaSesion: {
    allOf: [
      ref('Usuario'),
      {
        type: 'object',
        properties: {
          rol: {
            type: 'object',
            nullable: true,
            properties: { id: entero(), nombre: texto(), permisos: lista('PermisoResumen') },
          },
        },
      },
    ],
  },

  ProveedorResumen: {
    type: 'object',
    nullable: true,
    properties: { id: entero(), nombre: texto() },
  },
  Producto: {
    type: 'object',
    properties: {
      id: entero(),
      codigo: texto('Se repite solo entre proveedores distintos'),
      nombre: texto(),
      stock: entero(),
      costo: entero('En pesos'),
      precioPublico: enteroOpcional('En pesos. Sin precio no se puede vender (regla 2).'),
      umbralMinimo: enteroOpcional('Sin umbral solo se sugiere reponer cuando no hay stock'),
      proveedorId: enteroOpcional(),
      ...FECHAS,
      proveedor: ref('ProveedorResumen'),
    },
  },
  ProductoAlta: {
    type: 'object',
    required: ['codigo', 'nombre', 'costo'],
    properties: {
      codigo: texto(),
      nombre: texto(),
      stock: entero('Sin stock, el articulo se da de alta con 0'),
      costo: entero(),
      precioPublico: enteroOpcional('null (o vacio) lo deja sin precio'),
      umbralMinimo: enteroOpcional('null (o vacio) lo deja sin umbral'),
      proveedorId: enteroOpcional('null (o vacio) lo deja sin proveedor'),
    },
  },
  ProductoModificacion: {
    type: 'object',
    description: 'Solo los campos que cambian',
    properties: {
      codigo: texto(),
      nombre: texto(),
      stock: entero(),
      costo: entero(),
      precioPublico: enteroOpcional(),
      umbralMinimo: enteroOpcional(),
      proveedorId: enteroOpcional(),
    },
  },

  Proveedor: {
    type: 'object',
    properties: {
      id: entero(),
      nombre: texto(),
      ...FECHAS,
      cantidadArticulos: entero('Articulos que tiene asociados: con alguno no se puede dar de baja'),
    },
  },
  ProveedorDatos: {
    type: 'object',
    required: ['nombre'],
    properties: { nombre: texto('No se puede repetir') },
  },
  ProveedorModificacion: {
    type: 'object',
    properties: { nombre: texto('No se puede repetir') },
  },

  Venta: {
    type: 'object',
    properties: {
      id: entero(),
      articulos: {
        type: 'array',
        description: 'Codigo, nombre y precio tomados de la base al registrar la venta',
        items: {
          type: 'object',
          properties: {
            productoId: entero(),
            codigo: texto(),
            nombre: texto(),
            precio: entero(),
            cantidad: entero(),
          },
        },
      },
      total: entero(),
      usuarioId: enteroOpcional('Usuario de la sesion que registro la venta'),
      usuarioNombre: { type: 'string', nullable: true },
      fecha: fecha(),
    },
  },
  VentaAlta: {
    type: 'object',
    required: ['articulos'],
    properties: {
      articulos: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productoId', 'cantidad'],
          properties: { productoId: entero(), cantidad: { type: 'integer', minimum: 1 } },
        },
      },
    },
  },

  Movimiento: {
    type: 'object',
    properties: {
      id: entero(),
      identificador: texto('Tipo, "#" y numero dentro del tipo (alta#1, venta#3...)'),
      tipo: { type: 'string', enum: ['alta', 'baja', 'modificacion', 'venta', 'entrada'] },
      entidad: { type: 'string', enum: ['producto', 'proveedor'] },
      detalle: texto(),
      cantidad: enteroOpcional('Unidades que cambiaron en el stock'),
      referencia: { type: 'string', nullable: true, description: 'Factura o remito de una entrada' },
      usuarioId: enteroOpcional('Usuario de la sesion que hizo la operacion'),
      usuarioNombre: { type: 'string', nullable: true },
      fecha: fecha(),
    },
  },
  EntradaStock: {
    type: 'object',
    required: ['productoId', 'cantidad'],
    properties: {
      productoId: entero(),
      cantidad: { type: 'integer', minimum: 1 },
      referencia: { type: 'string', nullable: true, maxLength: 100 },
    },
  },
  EntradaRegistrada: {
    type: 'object',
    properties: { movimiento: ref('Movimiento'), producto: ref('Producto') },
  },

  Dashboard: {
    type: 'object',
    properties: {
      articulos: entero('Articulos cargados'),
      sinStock: entero(),
      paraReponer: entero('Sin stock, o con el stock igual o menor a su umbral'),
      sinPrecio: entero(),
      reponer: { ...lista('Producto'), description: 'Los 6 mas urgentes de reponer' },
      articulosSinPrecio: { ...lista('Producto'), description: 'Los primeros 6 por codigo' },
    },
  },

  Usuario: {
    type: 'object',
    description: 'La contrasena nunca sale en las respuestas',
    properties: {
      id: entero(),
      nombre: texto(),
      apellido: texto(),
      email: { type: 'string', format: 'email' },
      telefono: { type: 'string', example: '11 12345678' },
      rolId: enteroOpcional(),
      ...FECHAS,
      rol: { type: 'object', nullable: true, properties: { id: entero(), nombre: texto() } },
    },
  },
  UsuarioAlta: {
    type: 'object',
    required: ['nombre', 'apellido', 'email', 'telefono', 'contrasena'],
    properties: {
      nombre: texto(),
      apellido: texto(),
      email: { type: 'string', format: 'email', description: 'No se puede repetir' },
      telefono: { type: 'string', pattern: '^\\d{2} \\d{8}$', example: '11 12345678' },
      contrasena: { type: 'string', format: 'password' },
      rolId: enteroOpcional('null (o vacio) deja al usuario sin rol'),
    },
  },
  UsuarioModificacion: {
    type: 'object',
    description: 'Solo los campos que cambian. Sin contrasena se conserva la que tenia.',
    properties: {
      nombre: texto(),
      apellido: texto(),
      email: { type: 'string', format: 'email', description: 'No se puede repetir' },
      telefono: { type: 'string', pattern: '^\\d{2} \\d{8}$' },
      contrasena: { type: 'string', format: 'password' },
      rolId: enteroOpcional(),
    },
  },

  Rol: {
    type: 'object',
    properties: { id: entero(), nombre: texto(), ...FECHAS, permisos: lista('PermisoResumen') },
  },
  RolAlta: {
    type: 'object',
    required: ['nombre'],
    properties: {
      nombre: texto(),
      permisoIds: { type: 'array', items: { type: 'integer' }, uniqueItems: true, default: [] },
    },
  },
  RolModificacion: {
    type: 'object',
    properties: { nombre: texto() },
  },
  RolPermisos: {
    type: 'object',
    required: ['permisoIds'],
    properties: {
      permisoIds: {
        type: 'array',
        description: 'Reemplaza a la lista anterior entera',
        items: { type: 'integer' },
        uniqueItems: true,
      },
    },
  },

  Permiso: {
    type: 'object',
    properties: { id: entero(), nombre: texto('El de una pantalla'), ...FECHAS },
  },
  PermisoResumen: {
    type: 'object',
    properties: { id: entero(), nombre: texto() },
  },
  PermisoDatos: {
    type: 'object',
    required: ['nombre'],
    properties: { nombre: texto('No se puede repetir') },
  },
  PermisoModificacion: {
    type: 'object',
    properties: { nombre: texto('No se puede repetir') },
  },
};

module.exports = { ESQUEMAS, ref, lista };
