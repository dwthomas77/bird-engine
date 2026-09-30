// IMPORTANT: .js extension required
import Fastify from "fastify";
import cors from "@fastify/cors";
import type { FastifyError, FastifySchemaValidationError } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import path from "node:path";
import habitatRoutes from "./routes/habitat.routes.js";
import speciesRoutes from "./routes/species.routes.js";
import birdRoutes from "./routes/bird.routes.js";
import userRoutes from "./routes/user.routes.js";
import {
  HabitatSchema,
  HabitatRequestSchema,
} from "./schema/habitat.schema.js";
import {
  SpeciesSchema,
  SpeciesRequestSchema,
  SpeciesReadSchema,
} from "./schema/species.schema.js";
import { BirdSchema } from "./schema/bird.schema.js";
import { UserSchema, UserRequestSchema } from "./schema/user.schema.js";
import { AppError, errorToProblemDetails } from "./errors.js";

import {
  habitatRepositoryFactory,
  HabitatRepository,
} from "./repositories/habitat.repository.js";
import {
  habitatServiceFactory,
  HabitatService,
} from "./services/habitat.service.js";
import {
  habitatSpeciesServiceFactory,
  SpeciesHabitatService,
} from "./services/habitatSpecies.service.js";
import {
  speciesServiceFactory,
  SpeciesService,
} from "./services/species.service.js";
import {
  birdServiceFactory,
  BirdService,
} from "./services/bird.service.js";
import {
  speciesRepositoryFactory,
  SpeciesRepository,
} from "./repositories/species.repository.js";
import {
  habitatSpeciesRepositoryFactory,
  HabitatSpeciesRepository,
} from "./repositories/habitatSpecies.repository.js";
import {
  userRepositoryFactory,
  UserRepository,
} from "./repositories/user.repository.js";
import { userServiceFactory, UserService } from "./services/user.service.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: {
      habitat: HabitatRepository;
      species: SpeciesRepository;
      habitatSpecies: HabitatSpeciesRepository;
      user: UserRepository;
    };
    services: {
      habitat: HabitatService;
      species: SpeciesService;
      speciesHabitat: SpeciesHabitatService;
      bird: BirdService;
      user: UserService;
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
    species: speciesRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    habitatSpecies: habitatSpeciesRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    user: userRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
  };

  const speciesHabitat = habitatSpeciesServiceFactory({
    habitatSpeciesRepository: repositories.habitatSpecies,
    habitatRepository: repositories.habitat,
  });

  const services = {
    habitat: habitatServiceFactory({
      repository: repositories.habitat,
    }),
    speciesHabitat,
    species: speciesServiceFactory({
      speciesRepository: repositories.species,
      speciesHabitatService: speciesHabitat,
    }),
    bird: birdServiceFactory({
      speciesRepository: repositories.species,
    }),
    user: userServiceFactory({
      userRepository: repositories.user,
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

  app.addSchema(SpeciesSchema);
  app.addSchema(SpeciesRequestSchema);
  app.addSchema(SpeciesReadSchema);
  app.addSchema(BirdSchema);
  app.addSchema(UserSchema);
  app.addSchema(UserRequestSchema);

  // Routes
  app.register(habitatRoutes);
  app.register(speciesRoutes);
  app.register(birdRoutes);
  app.register(userRoutes);

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
