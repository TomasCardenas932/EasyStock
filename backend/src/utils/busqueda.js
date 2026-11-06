const { Op, fn, col, where } = require('sequelize');

// Condicion de busqueda: la columna contiene el texto, sin distinguir
// mayusculas (lower) y sin tomar % ni _ como comodines, como LIKE. instr da la
// posicion del texto, o 0 si no esta; con el texto vacio da 1 y trae todas las
// filas. La columna va calificada con el modelo ("Producto.nombre") cuando la
// consulta une otra tabla con una columna del mismo nombre.
const contiene = (columna, texto) =>
  where(fn('instr', fn('lower', col(columna)), fn('lower', texto)), { [Op.gt]: 0 });

// El valor empieza con el texto (instr da 1).
const empiezaCon = (valor, texto) => where(fn('instr', valor, texto), 1);

module.exports = { contiene, empiezaCon };
