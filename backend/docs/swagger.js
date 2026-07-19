const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MindfulTrack API",
            version: "1.0.0",
            description: "API REST para la aplicación móvil MindfulTrack. Incluye autenticación JWT, gestión de usuarios y CRUD de hábitos."
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                RegisterRequest: {
                    type: "object",
                    required: ["nombre", "apellido", "correo", "password"],
                    properties: {
                        nombre: {
                            type: "string",
                            example: "Carlos"
                        },
                        apellido: {
                            type: "string",
                            example: "Chiriboga"
                        },
                        correo: {
                            type: "string",
                            example: "carlos@test.com"
                        },
                        password: {
                            type: "string",
                            example: "123456"
                        }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["correo", "password"],
                    properties: {
                        correo: {
                            type: "string",
                            example: "carlos@test.com"
                        },
                        password: {
                            type: "string",
                            example: "123456"
                        }
                    }
                },
                HabitRequest: {
                    type: "object",
                    required: ["nombre", "objetivo_diario"],
                    properties: {
                        nombre: {
                            type: "string",
                            example: "Leer 45 minutos"
                        },
                        descripcion: {
                            type: "string",
                            example: "Leer un libro de hábitos y productividad"
                        },
                        objetivo_diario: {
                            type: "integer",
                            example: 45
                        }
                    }
                }
            }
        }
    },
    apis: [
        "./src/routes/*.js"  // ← CAMBIADO
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
};