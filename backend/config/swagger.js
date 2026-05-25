const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Systeme Gestion Globale API',
            version: '1.0.0',
            description: 'API documentation for Systeme Gestion Globale backend',
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                PvEssai: {
                    type: 'object',
                    properties: {
                        numero: { type: 'string' },
                        client: { type: 'string' },
                        power: { type: 'number' },
                    },
                },
                Commande: {
                    type: 'object',
                    properties: {
                        numero: { type: 'string' },
                        client: { type: 'string' },
                        total: { type: 'number' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/v1/*.js', './controllers/*.js'], // files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
