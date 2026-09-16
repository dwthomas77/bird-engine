import type { FastifyInstance } from "fastify";
import { getAllSpeciesController, getSpeciesByIdController, postNewSpeciesController, removeExistingSpeciesController, updateExistingSpeciesController } from "./species.controller.js";

async function routes(fastify: FastifyInstance) {
  fastify.get("/species", { schema: { response: { 200: { type: "array", items: { $ref: "api/species/read#" } } } } }, getAllSpeciesController);
  fastify.get("/species/:uid", { schema: { response: { 200: { $ref: "api/species/read#" } } } }, getSpeciesByIdController);
  fastify.post("/species", { schema: { body: { $ref: "api/species/create#" }, response: { 200: { $ref: "api/species/read#" } } } }, postNewSpeciesController);
  fastify.delete("/species/:uid", removeExistingSpeciesController);
  fastify.put("/species/:uid", { schema: { body: { $ref: "api/species/create#" }, response: { 200: { $ref: "api/species/read#" } } } }, updateExistingSpeciesController);
}

export default routes;