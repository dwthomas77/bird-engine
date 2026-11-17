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
import observationRoutes from "./routes/observation.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import observationGroupRoutes from "./routes/observationGroup.routes.js";

import {
  ObservationGroupSchema,
  ObservationGroupRequestSchema,
} from "./schema/observationGroup.schema.js";
import { ObservationGroupFamilySchema } from "./schema/observationGroupFamily.schema.js";
import { ObservationGroupGenusSchema } from "./schema/observationGroupGenus.schema.js";
import { ObservationGroupSpeciesSchema } from "./schema/observationGroupSpecies.schema.js";
import {
  observationGroupRepositoryFactory,
  ObservationGroupRepository,
} from "./repositories/observationGroup.repository.js";
import {
  observationGroupServiceFactory,
  ObservationGroupService,
} from "./services/observationGroup.service.js";
import {
  observationGroupSpeciesServiceFactory,
  ObservationGroupSpeciesService,
} from "./services/observationGroupSpecies.service.js";
import {
  observationGroupGenusServiceFactory,
  ObservationGroupGenusService,
} from "./services/observationGroupGenus.service.js";
import {
  observationGroupFamilyServiceFactory,
  ObservationGroupFamilyService,
} from "./services/observationGroupFamily.service.js";
import {
  observationGroupMembershipServiceFactory,
  ObservationGroupMembershipService,
} from "./services/observationGroupMembership.service.js";
import {
  HabitatSchema,
  HabitatRequestSchema,
} from "./schema/habitat.schema.js";
import {
  SpeciesSchema,
  SpeciesRequestSchema,
  SpeciesReadSchema,
  SpeciesSummarySchema,
} from "./schema/species.schema.js";
import { BirdSchema } from "./schema/bird.schema.js";
import { UserSchema, UserRequestSchema } from "./schema/user.schema.js";
import {
  ObservationSchema,
  ObservationRequestSchema,
} from "./schema/observation.schema.js";
import {
  JournalSchema,
  JournalRequestSchema,
  JournalSummarySchema,
} from "./schema/journal.schema.js";
import { LocationSchema } from "./schema/location.schema.js";
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
import { birdServiceFactory, BirdService } from "./services/bird.service.js";
import {
  speciesRepositoryFactory,
  SpeciesRepository,
} from "./repositories/species.repository.js";
import {
  taxonRepositoryFactory,
  TaxonRepository,
} from "./repositories/taxon.repository.js";
import {
  habitatSpeciesRepositoryFactory,
  HabitatSpeciesRepository,
} from "./repositories/habitatSpecies.repository.js";
import {
  observationGroupSpeciesRepositoryFactory,
  ObservationGroupSpeciesRepository,
} from "./repositories/observationGroupSpecies.repository.js";
import {
  observationGroupGenusRepositoryFactory,
  ObservationGroupGenusRepository,
} from "./repositories/observationGroupGenus.repository.js";
import {
  observationGroupFamilyRepositoryFactory,
  ObservationGroupFamilyRepository,
} from "./repositories/observationGroupFamily.repository.js";
import {
  userRepositoryFactory,
  UserRepository,
} from "./repositories/user.repository.js";
import { userServiceFactory, UserService } from "./services/user.service.js";
import {
  observationRepositoryFactory,
  ObservationRepository,
} from "./repositories/observation.repository.js";
import {
  observationServiceFactory,
  ObservationService,
} from "./services/observation.service.js";
import {
  journalRepositoryFactory,
  JournalRepository,
} from "./repositories/journal.repository.js";
import {
  journalServiceFactory,
  JournalService,
} from "./services/journal.service.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: {
      habitat: HabitatRepository;
      species: SpeciesRepository;
      taxon: TaxonRepository;
      habitatSpecies: HabitatSpeciesRepository;
      user: UserRepository;
      observation: ObservationRepository;
      journal: JournalRepository;
      observationGroup: ObservationGroupRepository;
      observationGroupSpecies: ObservationGroupSpeciesRepository;
      observationGroupGenus: ObservationGroupGenusRepository;
      observationGroupFamily: ObservationGroupFamilyRepository;
    };
    services: {
      habitat: HabitatService;
      species: SpeciesService;
      speciesHabitat: SpeciesHabitatService;
      bird: BirdService;
      user: UserService;
      observation: ObservationService;
      journal: JournalService;
      observationGroup: ObservationGroupService;
      observationGroupSpecies: ObservationGroupSpeciesService;
      observationGroupGenus: ObservationGroupGenusService;
      observationGroupFamily: ObservationGroupFamilyService;
      observationGroupMembership: ObservationGroupMembershipService;
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

  // Schema
  app.addSchema(HabitatSchema);
  app.addSchema(HabitatRequestSchema);
  app.addSchema(UserSchema);
  app.addSchema(UserRequestSchema);
  app.addSchema(JournalSchema);
  app.addSchema(JournalRequestSchema);
  app.addSchema(JournalSummarySchema);
  app.addSchema(LocationSchema);
  app.addSchema(SpeciesSchema);
  app.addSchema(SpeciesRequestSchema);
  app.addSchema(SpeciesReadSchema);
  app.addSchema(SpeciesSummarySchema);
  app.addSchema(BirdSchema);
  app.addSchema(ObservationSchema);
  app.addSchema(ObservationRequestSchema);
  app.addSchema(ObservationGroupSchema);
  app.addSchema(ObservationGroupRequestSchema);
  app.addSchema(ObservationGroupFamilySchema);
  app.addSchema(ObservationGroupGenusSchema);
  app.addSchema(ObservationGroupSpeciesSchema);

  app.register(swagger, {
    openapi: {
      info: {
        title: "Bird Engine API",
        version: "1.0.0",
      },
      tags: [
        { name: "habitat", description: "Habitats where Species are found" },
        { name: "species", description: "Species of Birds" },
        { name: "bird", description: "Birds" },
        { name: "user", description: "Users" },
        { name: "observation", description: "Observations of Birds" },
        { name: "journal", description: "Journals of Bird Observations" },
        { name: "observationGroup", description: "Groups of related Observations" },
        { name: "observationGroupFamily", description: "Families in observation groups" },
        { name: "observationGroupGenus", description: "Genera in observation groups" },
        { name: "observationGroupSpecies", description: "Species in observation groups" },
      ],
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
    taxon: taxonRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    habitatSpecies: habitatSpeciesRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    user: userRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    observation: observationRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    journal: journalRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    observationGroup: observationGroupRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    observationGroupSpecies: observationGroupSpeciesRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    observationGroupGenus: observationGroupGenusRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
    observationGroupFamily: observationGroupFamilyRepositoryFactory({
      dataDir: options.dataFilePath || dataSource,
    }),
  };

  const speciesHabitat = habitatSpeciesServiceFactory({
    habitatSpeciesRepository: repositories.habitatSpecies,
    habitatRepository: repositories.habitat,
  });

  const observationService = observationServiceFactory({
    observationRepository: repositories.observation,
  });

  const userService = userServiceFactory({
    userRepository: repositories.user,
  });

  const services = {
    habitat: habitatServiceFactory({
      repository: repositories.habitat,
    }),
    speciesHabitat,
    species: speciesServiceFactory({
      speciesRepository: repositories.species,
      speciesHabitatService: speciesHabitat,
      taxonRepository: repositories.taxon,
    }),
    bird: birdServiceFactory({
      speciesRepository: repositories.species,
      speciesHabitatService: speciesHabitat,
    }),
    user: userService,
    observation: observationService,
    journal: journalServiceFactory({
      journalRepository: repositories.journal,
      userService: userService,
      observationService: observationService,
    }),
    observationGroup: observationGroupServiceFactory({
      observationGroupRepository: repositories.observationGroup,
    }),
    observationGroupSpecies: observationGroupSpeciesServiceFactory({
      observationGroupSpeciesRepository: repositories.observationGroupSpecies,
      observationGroupRepository: repositories.observationGroup,
      speciesRepository: repositories.species,
    }),
    observationGroupGenus: observationGroupGenusServiceFactory({
      observationGroupGenusRepository: repositories.observationGroupGenus,
      observationGroupRepository: repositories.observationGroup,
      taxonRepository: repositories.taxon,
    }),
    observationGroupFamily: observationGroupFamilyServiceFactory({
      observationGroupFamilyRepository: repositories.observationGroupFamily,
      observationGroupRepository: repositories.observationGroup,
      taxonRepository: repositories.taxon,
    }),
    observationGroupMembership: observationGroupMembershipServiceFactory({
      observationGroupRepository: repositories.observationGroup,
      observationGroupSpeciesRepository: repositories.observationGroupSpecies,
      observationGroupGenusRepository: repositories.observationGroupGenus,
      observationGroupFamilyRepository: repositories.observationGroupFamily,
      speciesRepository: repositories.species,
      taxonRepository: repositories.taxon,
    }),
  };

  app.decorate("repositories", repositories);
  app.decorate("services", services);

  app.get("/health-check", function (request, reply) {
    reply.send({ health: "ok" });
  });

  // Routes
  app.register(habitatRoutes);
  app.register(userRoutes);
  app.register(journalRoutes);
  app.register(speciesRoutes);
  app.register(birdRoutes);
  app.register(observationRoutes);
  app.register(observationGroupRoutes);

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
