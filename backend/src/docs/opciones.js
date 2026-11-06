// Opciones de Swagger UI (routes/docs.js).
const OPCIONES = {
  customSiteTitle: 'EasyStock API',
  // En modo oscuro Swagger UI deja las celdas de las tablas de pruebas con el
  // texto oscuro del modo claro: se les pone el color de los parrafos.
  customCss: 'html.dark-mode .swagger-ui .renderedMarkdown td { color: #e4e6e6; }',
  swaggerOptions: {
    // El token sobrevive a recargar la pagina.
    persistAuthorization: true,
    displayRequestDuration: true,
    // Corre en el navegador: despues de un inicio de sesion correcto deja el
    // token en Authorize, asi los pedidos siguientes ya van con sesion.
    responseInterceptor: (respuesta) => {
      if (respuesta.url.endsWith('/api/sesion') && respuesta.status === 200 && respuesta.obj?.token) {
        const esquema = window.ui.specSelectors
          .specJson()
          .getIn(['components', 'securitySchemes', 'sesion'])
          .toJS();
        window.ui.authActions.authorizeWithPersistOption({
          sesion: { name: 'sesion', schema: esquema, value: respuesta.obj.token },
        });
      }
      return respuesta;
    },
  },
};

module.exports = OPCIONES;
