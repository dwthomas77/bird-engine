import { schemaRef } from "../schema/ids.js";
import type { FastifyInstance } from "fastify";
import { observationGroupControllerFactory } from "../controllers/observationGroup.controller.js";

const params = {
  type: "object",
  properties: { observationGroupId: { type: "string" } },
  required: ["observationGroupId"],
} as const;

async function routes(fastify: FastifyInstance) {
  const controllers = observationGroupControllerFactory({
    service: fastify.services.observationGroup,
  });

  fastify.get(
    "/observation-groups",
    {
      schema: {
        tags: ["observationGroup"],
        description: "Get all observation groups",
        response: {
          200: { type: "array", items: { $ref: schemaRef("observationGroup") } },
        },
      },
    },
    controllers.getAllObservationGroupsController,
  );
  fastify.get(
    "/observation-groups/:observationGroupId",
    {
      schema: {
        tags: ["observationGroup"],
        params,
        response: { 200: { $ref: schemaRef("observationGroup") } },
      },
    },
    controllers.getObservationGroupByIdController,
  );
  fastify.post(
    "/observation-groups",
    {
      schema: {
        tags: ["observationGroup"],
        body: { $ref: schemaRef("observationGroup/request") },
        response: { 200: { $ref: schemaRef("observationGroup") } },
      },
    },
    controllers.postNewObservationGroupController,
  );
  fastify.put(
    "/observation-groups/:observationGroupId",
    {
      schema: {
        tags: ["observationGroup"],
        params,
        body: { $ref: schemaRef("observationGroup/request") },
        response: { 200: { $ref: schemaRef("observationGroup") } },
      },
    },
    controllers.updateObservationGroupController,
  );
  fastify.delete(
    "/observation-groups/:observationGroupId",
    {
      schema: {
        tags: ["observationGroup"],
        params,
        response: { 204: { type: "null" } },
      },
    },
    controllers.deleteObservationGroupController,
  );
}

export default routes;
