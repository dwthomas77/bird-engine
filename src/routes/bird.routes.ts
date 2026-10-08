import { schemaRef } from "../schema/ids.js";
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
        description:
          "Get a randomly generated bird, optionally limited to species found in a habitat",
        querystring: {
          type: "object",
          properties: {
            habitatId: { type: "string" },
          },
        },
        response: {
          200: { $ref: schemaRef("bird") },
        },
      },
    },
    getBirdController,
  );
}

export default routes;
