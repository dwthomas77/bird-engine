import type { FastifyInstance } from "fastify";
import { journalControllerFactory } from "../controllers/journal.controller.js";

async function routes(fastify: FastifyInstance) {
  const controllers = journalControllerFactory({
    service: fastify.services.journal,
  });

  fastify.get(
    "/journals",
    {
      schema: {
        tags: ["journal"],
        description: "Get all journals",
        response: {
          200: {
            type: "array",
            items: { $ref: "api/journal#" },
          },
        },
      },
    },
    controllers.getAllJournalsController,
  );
  fastify.get(
    "/journals/:journalId",
    {
      schema: {
        tags: ["journal"],
        params: {
          type: "object",
          properties: { journalId: { type: "string" } },
          required: ["journalId"],
        },
        response: {
          200: { $ref: "api/journal#" },
        },
      },
    },
    controllers.getJournalByIdController,
  );
  fastify.post(
    "/journals",
    {
      schema: {
        tags: ["journal"],
        body: { $ref: "api/journal/request#" },
        response: {
          200: { $ref: "api/journal#" },
        },
      },
    },
    controllers.postNewJournalController,
  );
  fastify.put(
    "/journals/:journalId",
    {
      schema: {
        tags: ["journal"],
        params: {
          type: "object",
          properties: { journalId: { type: "string" } },
          required: ["journalId"],
        },
        body: { $ref: "api/journal/request#" },
        response: {
          200: { $ref: "api/journal#" },
        },
      },
    },
    controllers.updateJournalController,
  );
  fastify.delete(
    "/journals/:journalId",
    {
      schema: {
        tags: ["journal"],
        params: {
          type: "object",
          properties: { journalId: { type: "string" } },
          required: ["journalId"],
        },
        response: {
          204: { type: "null" },
        },
      },
    },
    controllers.deleteJournalController,
  );
}

export default routes;
