// IMPORTANT: .js extension required
import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import habitatRoutes from "./resource/habitat/habitat.routes.js";
import habitatSchema from "./resource/habitat/habitat.schema.js";
import speciesRoutes from "./resource/species/species.routes.js";
import { SpeciesEntity, ReadSpeciesSchema, CreateSpeciesSchema } from "./resource/species/species.schema.js";
import { AppError, errorToProblemDetails } from "./errors.js";
console.log("𓅪 𓅪  Starting Bird Engine, Brrrrrr cheep cheep cheep 𓅪 𓅪 𓅪");

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Bird Engine API',
      version: '1.0.0'
    }
  }
});

fastify.register(swaggerUI, {
  routePrefix: '/docs'
});

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

// Schema
fastify.addSchema(habitatSchema);
fastify.addSchema(SpeciesEntity);
fastify.addSchema(ReadSpeciesSchema);
fastify.addSchema(CreateSpeciesSchema);

fastify.register(habitatRoutes);
fastify.register(speciesRoutes);

fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    const problemDetails = errorToProblemDetails(error as AppError);
    reply.status(problemDetails.status).send(problemDetails);
  } else {
    reply.status(500).send({ error: "Internal Server Error" });
  }
});

const port = Number(process.env.PORT ?? 3000);

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`bird engine is now running on ${address}`);
});
