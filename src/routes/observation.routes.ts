import type { FastifyInstance } from "fastify";
import { observationControllerFactory } from "../controllers/observation.controller.js";

async function routes(fastify: FastifyInstance) {
  const {
    getAllObservationsController,
    postNewObservationController,
    getObservationByIdController,
    removeExistingObservationController,
    updateExistingObservationController,
  } = observationControllerFactory({ service: fastify.services.observation });

  fastify.get(
    "/observations",
    {
      schema: {
        tags: ["observation"],
        description: "Get all observations",
        response: {
          200: {
            type: "array",
            items: { $ref: "api/observation#" },
          },
        },
      },
    },
    getAllObservationsController,
  );
  fastify.get(
    "/observations/:uid",
    {
      schema: {
        tags: ["observation"],
        params: {
          type: "object",
          properties: { uid: { type: "string" } },
          required: ["uid"],
        },
        response: {
          200: { $ref: "api/observation#" },
        },
      },
    },
    getObservationByIdController,
  );
  fastify.post(
    "/observations",
    {
      schema: {
        tags: ["observation"],
        body: { $ref: "api/observation/request#" },
        response: {
          200: { $ref: "api/observation#" },
        },
      },
    },
    postNewObservationController,
  );
  fastify.delete(
    "/observations/:uid",
    {
      schema: {
        tags: ["observation"],
        params: {
          type: "object",
          properties: { uid: { type: "string" } },
          required: ["uid"],
        },
        response: {
          204: { type: "null" },
        },
      },
    },
    removeExistingObservationController,
  );
  fastify.put(
    "/observations/:uid",
    {
      schema: {
        tags: ["observation"],
        params: {
          type: "object",
          properties: { uid: { type: "string" } },
          required: ["uid"],
        },
        body: { $ref: "api/observation/request#" },
        response: {
          200: { $ref: "api/observation#" },
        },
      },
    },
    updateExistingObservationController,
  );
}

export default routes;
