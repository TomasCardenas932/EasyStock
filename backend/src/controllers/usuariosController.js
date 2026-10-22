const { literal } = require('sequelize');
const { Usuario, Rol } = require('../models');

// Las verificaciones corren antes, en middlewares/usuariosMiddleware.js:
// req.body llega validado y limpio, el rol indicado existe y req.usuario es
// el usuario de :id. La contrasena nunca sale en las respuestas (ver el
// modelo Usuario).

// El rol viaja como objeto anidado.
const INCLUIR_ROL = { model: Rol, as: 'rol', attributes: ['id', 'nombre'] };

const ESCAPE_LIKE = '!';

const patronBusqueda = (texto) => {
  const escapado = texto.replace(/[!%_]/g, (caracter) => ESCAPE_LIKE + caracter);
  return `%${escapado}%`;
};

// El JOIN con roles trae otra columna `nombre`: sin calificar, SQLite la
// rechaza por ambigua.
const FILTRO_BUSQUEDA =
  "(`Usuario`.`nombre` LIKE :patron ESCAPE '!' OR `Usuario`.`apellido` LIKE :patron ESCAPE '!')";

const obtenerUsuarios = async (req, res) => {
  const usuarios = await Usuario.findAll({
    where: literal(FILTRO_BUSQUEDA),
    replacements: { patron: patronBusqueda(req.query.buscar) },
    include: INCLUIR_ROL,
    order: [
      ['apellido', 'ASC'],
      ['nombre', 'ASC'],
    ],
  });

  res.json(usuarios);
};

const obtenerUsuarioId = async (req, res) => {
  res.json(await req.usuario.reload({ include: INCLUIR_ROL }));
};

const crearUsuario = async (req, res) => {
  const usuario = await Usuario.create(req.body);
  res.status(201).json(await usuario.reload({ include: INCLUIR_ROL }));
};

const modificarUsuario = async (req, res) => {
  await req.usuario.update(req.body);
  res.json(await req.usuario.reload({ include: INCLUIR_ROL }));
};

const bajaUsuario = async (req, res) => {
  await req.usuario.destroy();
  res.status(204).end();
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  modificarUsuario,
  bajaUsuario,
};
