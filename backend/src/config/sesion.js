'use strict';

const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

// Firma de los tokens de sesion. El secreto sale de la variable de entorno
// SESION_SECRETO; sin ella, de un archivo local que se genera al azar la
// primera vez que arranca el servidor y no se sube al repositorio
// (.gitignore). Ningun secreto queda escrito en el codigo: con uno conocido
// cualquiera podria firmar un token valido. En produccion la variable es
// obligatoria, y las pruebas usan uno al azar que dura lo que la corrida.
const ARCHIVO_LOCAL = path.join(__dirname, '..', 'database', 'sesion.secreto');

const nuevoSecreto = () => randomBytes(32).toString('hex');

// El archivo se conserva entre reinicios: las sesiones abiertas siguen
// valiendo despues de reiniciar el servidor.
function secretoLocal() {
  if (!fs.existsSync(ARCHIVO_LOCAL)) {
    fs.writeFileSync(ARCHIVO_LOCAL, nuevoSecreto(), { mode: 0o600 });
  }
  return fs.readFileSync(ARCHIVO_LOCAL, 'utf8');
}

function secretoSinVariable() {
  if (process.env.NODE_ENV === 'production') return null;
  if (process.env.NODE_ENV === 'test') return nuevoSecreto();
  return secretoLocal();
}

const secreto = process.env.SESION_SECRETO ?? secretoSinVariable();

if (!secreto) {
  throw new Error('Falta la variable de entorno SESION_SECRETO');
}

module.exports = {
  secreto,
  // Un turno de trabajo: despues hay que volver a iniciar sesion.
  duracion: '8h',
};
