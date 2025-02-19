const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PROJECT API",
      version: "1.0.0",
      description: "Functional Specifications for Claim Request API",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = swaggerDocs;
