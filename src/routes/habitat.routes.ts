import { schemaRef } from "../schema/ids.js";
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
        description:
          "Get habitats, optionally filtered by code and parentId. parentId=null (or empty) returns only habitats with no parent",
        querystring: {
          type: "object",
          properties: {
            code: { type: "string" },
            parentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              $ref: schemaRef("habitat"),
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
          200: { $ref: schemaRef("habitat") },
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
        body: { $ref: schemaRef("habitat/request") },
        response: {
          200: { $ref: schemaRef("habitat") },
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
        body: { $ref: schemaRef("habitat/request") },
        response: {
          200: { $ref: schemaRef("habitat") },
        },
      },
    },
    updateExistingHabitatController,
  );

}

export default routes;
