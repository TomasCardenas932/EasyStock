// Pruebas de la API (npm test): corre en orden cada caso de docs/endpoints/,
// los mismos que muestra Swagger en /api/docs, y compara el status y la
// respuesta con los documentados. Usa una base temporal en memoria con las
// migraciones, los seeders admin-inicial y rol-empleado y los datos de
// docs/datosDeEjemplo.js.
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// La configuracion "test" de config/config.js es SQLite en memoria: la base
// existe mientras corren las pruebas. Se elige antes de cargar los modelos.
process.env.NODE_ENV = 'test';

const { sequelize, Sequelize } = require('../src/models');
const app = require('../src/app');
const { OPERACIONES, casosDe } = require('../src/docs/pruebas');
const { cargarDatosDeEjemplo } = require('../src/docs/datosDeEjemplo');

const SRC = path.join(__dirname, '..', 'src');

// Los seeders de proveedores y productos no: los datos de ejemplo traen los
// suyos.
const SEEDERS = ['20261022140000-admin-inicial.js', '20261026130000-rol-empleado.js'];

// Contrasena con la que el seeder admin-inicial carga a Tomas: sin la variable
// la generaria al azar.
process.env.ADMIN_CONTRASENA = 'demo-tomas';

// Usuario de cada sesion de las pruebas: Tomas es el del seeder admin-inicial y
// los otros dos, de los datos de ejemplo.
const CREDENCIALES = {
  admin: { email: 'tomas.cardenas@example.com', contrasena: process.env.ADMIN_CONTRASENA },
  empleado: { email: 'juan.lopez@example.com', contrasena: 'demo-juan' },
  'sin rol': { email: 'sofia.paz@example.com', contrasena: 'demo-sofia' },
};

// Campos que cambian en cada corrida: se comparan solo si estan.
const VARIABLES = new Set(['createdAt', 'updatedAt', 'fecha', 'token']);

const sinVariables = (valor) => {
  if (Array.isArray(valor)) return valor.map(sinVariables);
  if (valor === null || typeof valor !== 'object') return valor;
  return Object.fromEntries(
    Object.entries(valor).map(([campo, dato]) => [
      campo,
      VARIABLES.has(campo) ? '(cambia en cada corrida)' : sinVariables(dato),
    ])
  );
};

const tokens = { 'token no valido': 'no-valido' };
let servidor;
let api;

async function pedir(metodo, ruta, { params = {}, query = {}, body, sesion }) {
  const camino = ruta.replace(/\{(\w+)\}/g, (_, nombre) => encodeURIComponent(params[nombre]));
  const consulta = new URLSearchParams(query).toString();
  const token = tokens[sesion];
  const res = await fetch(`${api}${camino}${consulta && `?${consulta}`}`, {
    method: metodo.toUpperCase(),
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  return { status: res.status, cuerpo: texto ? JSON.parse(texto) : undefined };
}

// Corre el up de cada migracion o seeder, en orden.
async function ejecutar(carpeta, archivos) {
  const queryInterface = sequelize.getQueryInterface();
  for (const archivo of archivos) {
    await require(path.join(SRC, carpeta, archivo)).up(queryInterface, Sequelize);
  }
}

before(async () => {
  await ejecutar('migrations', fs.readdirSync(path.join(SRC, 'migrations')).sort());
  await ejecutar('seeders', SEEDERS);
  await cargarDatosDeEjemplo();

  servidor = app.listen(0);
  await once(servidor, 'listening');
  api = `http://localhost:${servidor.address().port}/api`;

  for (const [sesion, credenciales] of Object.entries(CREDENCIALES)) {
    tokens[sesion] = (await pedir('post', '/sesion', { body: credenciales })).cuerpo.token;
  }
});

after(async () => {
  servidor?.close();
  await sequelize.close();
});

for (const { ruta, metodo, op } of OPERACIONES) {
  describe(`${metodo.toUpperCase()} ${ruta}`, () => {
    for (const caso of casosDe(op)) {
      test(caso.titulo, async () => {
        const { status, cuerpo } = await pedir(metodo, ruta, caso);

        assert.equal(status, caso.status, `Respondio: ${JSON.stringify(cuerpo)}`);
        assert.deepEqual(sinVariables(cuerpo), sinVariables(caso.respuesta));
      });
    }
  });
}
