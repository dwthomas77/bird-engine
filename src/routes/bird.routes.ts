import type { FastifyInstance } from "fastify";
import { birdControllerFactory } from "../controllers/bird.controller.js";

async function routes(fastify: FastifyInstance) {
  const { getBirdController } = birdControllerFactory({
    service: fastify.services.bird,
  });

  fastify.get(
    "/bird",
    {
      schema: {
        tags: ["bird"],
        description: "Get a randomly generated bird",
        response: {
          200: { $ref: "https://bird-engine.local/api/bird#" },
        },
      },
    },
    getBirdController,
  );
}

export default routes;
