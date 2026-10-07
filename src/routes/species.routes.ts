import { schemaRef } from "../schema/ids.js";
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
							$ref: schemaRef("species/read"),
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
					200: { $ref: schemaRef("species/read") },
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
				body: { $ref: schemaRef("species/request") },
				response: {
					200: { $ref: schemaRef("species/read") },
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
				body: { $ref: schemaRef("species/request") },
				response: {
					200: { $ref: schemaRef("species/read") },
				},
			},
		},
		updateExistingSpeciesController,
	);
}

export default routes;
