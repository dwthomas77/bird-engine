import { schemaRef } from "../schema/ids.js";
import type { FastifyInstance } from "fastify";
import { userControllerFactory } from "../controllers/user.controller.js";

async function routes(fastify: FastifyInstance) {
  const controllers = userControllerFactory({
    service: fastify.services.user,
  });

  fastify.get(
    "/users",
    {
      schema: {
        tags: ["user"],
        description: "Get all users",
        response: {
          200: {
            type: "array",
            items: { $ref: schemaRef("user") },
          },
        },
      },
    },
    controllers.getAllUsersController,
  );
  fastify.get(
    "/users/:userId",
    {
      schema: {
        tags: ["user"],
        params: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
        response: {
          200: { $ref: schemaRef("user") },
        },
      },
    },
    controllers.getUserByIdController,
  );
  fastify.post(
    "/users",
    {
      schema: {
        tags: ["user"],
        body: { $ref: schemaRef("user/request") },
        response: {
          200: { $ref: schemaRef("user") },
        },
      },
    },
    controllers.postNewUserController,
  );
  fastify.put(
    "/users/:userId",
    {
      schema: {
        tags: ["user"],
        params: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
        body: { $ref: schemaRef("user/request") },
        response: {
          200: { $ref: schemaRef("user") },
        },
      },
    },
    controllers.updateUserController,
  );
  fastify.delete(
    "/users/:userId",
    {
      schema: {
        tags: ["user"],
        params: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
        response: {
          204: { type: "null" },
        },
      },
    },
    controllers.deleteUserController,
  );
}

export default routes;
