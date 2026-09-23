// IMPORTANT: .js extension required
import Fastify from "fastify";
import cors from "@fastify/cors";
import type { FastifyError, FastifySchemaValidationError } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import path from "node:path";
import habitatRoutes from "./routes/habitat.routes.js";
import {
  HabitatSchema,
  HabitatRequestSchema,
} from "./schema/habitat.schema.js";
// import speciesRoutes from "./resource/species/species.routes.js";
// import {
//   SpeciesEntity,
//   ReadSpeciesSchema,
//   CreateSpeciesSchema,
// } from "./resource/species/species.schema.js";
import { AppError, errorToProblemDetails } from "./errors.js";

import {
  habitatRepositoryFactory,
  HabitatRepository,
} from "./repositories/habitat.repository.js";
import {
  habitatServiceFactory,
  HabitatService,
} from "./services/habitat.service.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: {
      habitat: HabitatRepository;
    };
    services: {
      habitat: HabitatService;
    };
  }
}

interface appOptions {
  dataFilePath?: string;
}

export async function buildApp(options: appOptions = {}) {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "Bird Engine API",
        version: "1.0.0",
      },
    },
  });

  app.register(swaggerUI, {
    routePrefix: "/docs",
  });

  const dataSource = path.join(process.cwd(), "data");

  const repositories = {
    habitat: habitatRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
  };

  const services = {
    habitat: habitatServiceFactory({
      repository: repositories.habitat,
    }),
  };

  app.decorate("repositories", repositories);
  app.decorate("services", services);

  app.get("/health-check", function (request, reply) {
    reply.send({ health: "ok" });
  });

  // Schema
  app.addSchema(HabitatSchema);
  app.addSchema(HabitatRequestSchema);

  //app.addSchema(SpeciesEntity);
  //app.addSchema(ReadSpeciesSchema);
  //app.addSchema(CreateSpeciesSchema);

  // Routes
  app.register(habitatRoutes);
  //app.register(speciesRoutes);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      const problemDetails = errorToProblemDetails(error);
      return reply.status(problemDetails.status).send(problemDetails);
    }

    if (error.code === "FST_ERR_VALIDATION") {
      const validationError = error as Error & {
        validation: FastifySchemaValidationError[];
      };

      return reply.status(400).send({
        error: "Bad Request",
        message: error.message,
        validation: validationError.validation,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: "Internal Server Error",
    });
  });

  return app;
}
