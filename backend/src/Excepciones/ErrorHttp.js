// Error con status HTTP. Lo lanzan los middlewares cuando una verificacion
// suma al cuerpo de la respuesta un extra(por ejemplo `detalles` o `candidatos`).
class ErrorHttp extends Error {
  constructor(status, mensaje, extra = {}) {
    super(mensaje);
    this.status = status;
    this.extra = extra;
  }
}

module.exports = ErrorHttp;
