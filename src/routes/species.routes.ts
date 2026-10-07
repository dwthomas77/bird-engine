import type { FastifyInstance } from "fastify";
import { speciesControllerFactory } from "../controllers/species.controller.js";

async function routes(fastify: FastifyInstance) {
	const {
		getAllSpeciesController,
		postNewSpeciesController,
		getSpeciesByIdController,
		removeExistingSpeciesController,
		updateExistingSpeciesController,
	} = speciesControllerFactory({ service: fastify.services.species });

	fastify.get(
		"/species",
		{
			schema: {
				tags: ["species"],
				description: "Get all species",
				response: {
					200: {
						type: "array",
						items: {
							$ref: "https://bird-engine.local/api/species/read#",
						},
					},
				},
			},
		},
		getAllSpeciesController,
	);
	fastify.get(
		"/species/:uid",
		{
			schema: {
				tags: ["species"],
				params: {
					type: "object",
					properties: {
						uid: { type: "string" },
					},
					required: ["uid"],
				},
				response: {
					200: { $ref: "https://bird-engine.local/api/species/read#" },
				},
			},
		},
		getSpeciesByIdController,
	);
	fastify.post(
		"/species",
		{
			schema: {
				tags: ["species"],
				body: { $ref: "https://bird-engine.local/api/species/request#" },
				response: {
					200: { $ref: "https://bird-engine.local/api/species/read#" },
				},
			},
		},
		postNewSpeciesController,
	);
	fastify.delete(
		"/species/:uid",
		{
			schema: {
				tags: ["species"],
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
		removeExistingSpeciesController,
	);
	fastify.put(
		"/species/:uid",
		{
			schema: {
				tags: ["species"],
				params: {
					type: "object",
					properties: {
						uid: { type: "string" },
					},
					required: ["uid"],
				},
				body: { $ref: "https://bird-engine.local/api/species/request#" },
				response: {
					200: { $ref: "https://bird-engine.local/api/species/read#" },
				},
			},
		},
		updateExistingSpeciesController,
	);
}

export default routes;
