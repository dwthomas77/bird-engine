import type { FastifyInstance } from "fastify";
import { habitatControllerFactory } from "../controllers/habitat.controller.js";

async function routes(fastify: FastifyInstance) {
  const {
    getAllHabitatsController,
    postNewHabitatController,
    getHabitatByIdController,
    removeExistingHabitatController,
    updateExistingHabitatController,
  } = habitatControllerFactory({ service: fastify.services.habitat });

  fastify.get(
    "/habitats",
    {
      schema: {
        tags: ["habitat"],
        description: "Get all habitats",
        response: {
          200: {
            type: "array",
            items: {
              $ref: "api/habitat#",
            },
          },
        },
      },
    },
    getAllHabitatsController,
  );
  fastify.get(
    "/habitats/:uid",
    {
      schema: {
        tags: ["habitat"],
        params: {
          type: "object",
          properties: {
            uid: { type: "string" },
          },
          required: ["uid"],
        },
        response: {
          200: { $ref: "api/habitat#" },
        },
      },
    },
    getHabitatByIdController,
  );
  fastify.post(
    "/habitats",
    {
      schema: {
        tags: ["habitat"],
        body: { $ref: "api/habitat/request#" },
        response: {
          200: { $ref: "api/habitat#" },
        },
      },
    },
    postNewHabitatController,
  );
  fastify.delete(
    "/habitats/:uid",
    {
      schema: {
        tags: ["habitat"],
        params: {
          type: "object",
          properties: {
            uid: { type: "string" },
          },
          required: ["uid"],
        },
        response: {
          204: { type: "null" },
        },
      },
    },
    removeExistingHabitatController,
  );
  fastify.put(
    "/habitats/:uid",
    {
      schema: {
        tags: ["habitat"],
        params: {
          type: "object",
          properties: {
            uid: { type: "string" },
          },
          required: ["uid"],
        },
        body: { $ref: "api/habitat/request#" },
        response: {
          200: { $ref: "api/habitat#" },
        },
      },
    },
    updateExistingHabitatController,
  );

}

export default routes;
