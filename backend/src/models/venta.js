const { Model } = require('sequelize');

const esEntero = (valor, minimo) => Number.isInteger(valor) && valor >= minimo;

const esTexto = (valor) => typeof valor === 'string' && valor.trim() !== '';

// La columna JSON no tiene esquema propio: cada articulo se revisa aca para
// que no se guarden ventas con datos incompletos.
function validarArticulo(articulo, indice) {
  const n = indice + 1;
  if (articulo === null || typeof articulo !== 'object') {
    throw new Error(`El articulo ${n} de la venta no es valido`);
  }
  if (!esEntero(articulo.productoId, 1)) {
    throw new Error(`El articulo ${n} no indica a que producto corresponde`);
  }
  if (!esTexto(articulo.codigo) || !esTexto(articulo.nombre)) {
    throw new Error(`El articulo ${n} necesita codigo y nombre`);
  }
  if (!esEntero(articulo.precio, 0)) {
    throw new Error(`El precio del articulo ${n} debe ser un numero entero no negativo`);
  }
  if (!esEntero(articulo.cantidad, 1)) {
    throw new Error(`La cantidad del articulo ${n} debe ser un numero entero mayor a 0`);
  }
}

module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {}

  Venta.init(
    {
      articulos: {
        // Lista de { productoId, codigo, nombre, precio, cantidad }. Codigo,
        // nombre y precio son una copia de los del producto al momento de la
        // venta.
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notNull: { msg: 'La venta tiene que tener articulos' },
          esListaDeArticulos(articulos) {
            if (!Array.isArray(articulos) || articulos.length === 0) {
              throw new Error('La venta tiene que tener al menos un articulo');
            }
            articulos.forEach(validarArticulo);
          },
        },
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'El total es obligatorio' },
          isInt: { msg: 'El total debe ser un numero entero' },
          min: { args: [0], msg: 'El total no puede ser negativo' },
          // El total se deriva de los articulos: si no coincide, el registro
          // quedaria inconsistente para los informes de ventas.
          coincideConArticulos(total) {
            // Con un total o una lista invalidos no hay comparacion confiable;
            // esos errores ya los informan los otros validadores.
            const articulos = this.articulos;
            const sumables =
              Array.isArray(articulos) &&
              articulos.every((a) => esEntero(a?.precio, 0) && esEntero(a?.cantidad, 1));
            if (!sumables || !esEntero(Number(total), 0)) return;

            const suma = articulos.reduce(
              (acumulado, articulo) => acumulado + articulo.precio * articulo.cantidad,
              0
            );
            if (Number(total) !== suma) {
              throw new Error(`El total (${total}) no coincide con la suma de los articulos (${suma})`);
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Venta',
      tableName: 'ventas',
      underscored: true,
      // La fecha es la de alta del registro: Sequelize la completa sola al
      // crear la venta. Una venta no se edita, asi que no lleva updated_at.
      createdAt: 'fecha',
      updatedAt: false,
      hooks: {
        // Aunque llegue una fecha en los datos, se guarda siempre la del
        // momento en que se genera el registro.
        beforeCreate(venta) {
          venta.fecha = new Date();
        },
        // Un movimiento por articulo vendido, dentro de la transaccion de la
        // venta, con las unidades vendidas en negativo. Se guardan de a uno:
        // cada identificador sale de contar los movimientos de venta que ya
        // estan guardados.
        async afterCreate(venta, { transaction }) {
          for (const articulo of venta.articulos) {
            await sequelize.models.Movimiento.registrar(
              {
                tipo: 'venta',
                entidad: 'producto',
                detalle: `${articulo.codigo} - ${articulo.nombre}`,
                cantidad: -articulo.cantidad,
              },
              { transaction }
            );
          }
        },
      },
    }
  );

  return Venta;
};
