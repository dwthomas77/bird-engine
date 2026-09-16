import {
  getAllHabitatsController,
  postNewHabitatController,
  getHabitatByIdController,
  removeExistingHabitatController,
  updateExistingHabitatController
} from "./habitat.controller.js";
import type { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance) {
  fastify.get(
    "/habitats",
    {
      schema: {
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
  fastify.get("/habitats/:uid", getHabitatByIdController);
  fastify.post("/habitats", postNewHabitatController);
  fastify.delete("/habitats/:uid", removeExistingHabitatController);
  fastify.put("/habitats/:uid", updateExistingHabitatController);
}

export default routes;
