'use strict';

// Firma de los tokens de sesion. En produccion el secreto tiene que venir de
// la variable de entorno SESION_SECRETO: el de desarrollo esta en el
// repositorio y con el cualquiera podria firmar un token valido.
const DE_DESARROLLO = 'easystock-desarrollo';

const secreto =
  process.env.SESION_SECRETO ?? (process.env.NODE_ENV === 'production' ? null : DE_DESARROLLO);

if (!secreto) {
  throw new Error('Falta la variable de entorno SESION_SECRETO');
}

module.exports = {
  secreto,
  // Un turno de trabajo: despues hay que volver a iniciar sesion.
  duracion: '8h',
};
