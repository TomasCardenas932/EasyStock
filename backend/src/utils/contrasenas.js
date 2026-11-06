const { randomBytes, scrypt, timingSafeEqual } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

const LARGO_CLAVE = 64;

// Las contrasenas nunca se guardan en texto plano (FRD, CB-08): se guarda la
// sal y el hash scrypt, separados por ":". Lo usan el modelo Usuario y los
// seeders, que cargan usuarios sin pasar por el modelo.
async function hashear(contrasena) {
  const sal = randomBytes(16).toString('hex');
  const clave = await scryptAsync(contrasena, sal, LARGO_CLAVE);
  return `${sal}:${clave.toString('hex')}`;
}

// Compara una contrasena ingresada con el valor guardado por hashear().
async function coincide(contrasena, guardada) {
  const [sal, hash] = guardada.split(':');
  const clave = await scryptAsync(contrasena, sal, LARGO_CLAVE);
  return timingSafeEqual(clave, Buffer.from(hash, 'hex'));
}

module.exports = {
  hashear,
  coincide,
};
