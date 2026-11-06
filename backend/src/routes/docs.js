const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');

const openapi = require('../docs/openapi');
const OPCIONES = require('../docs/opciones');
const { obtenerEspecificacion } = require('../controllers/docsController');

const router = Router();

// GET /api/docs/openapi.json -> especificacion OpenAPI de la API
router.get('/openapi.json', obtenerEspecificacion);

// GET /api/docs -> Swagger UI con todos los endpoints y sus pruebas
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openapi, OPCIONES));

module.exports = router;
