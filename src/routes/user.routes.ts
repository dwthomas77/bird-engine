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
            items: { $ref: "https://bird-engine.local/api/user#" },
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
          200: { $ref: "https://bird-engine.local/api/user#" },
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
        body: { $ref: "https://bird-engine.local/api/user/request#" },
        response: {
          200: { $ref: "https://bird-engine.local/api/user#" },
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
        body: { $ref: "https://bird-engine.local/api/user/request#" },
        response: {
          200: { $ref: "https://bird-engine.local/api/user#" },
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
