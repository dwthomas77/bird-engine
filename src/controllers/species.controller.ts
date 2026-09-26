import { FastifyReply, FastifyRequest } from "fastify";
import type { SpeciesRequest } from "../types.js";
import type { SpeciesService } from "../services/species.service.js";

function speciesControllerFactory({ service }: { service: SpeciesService }) {
	async function getAllSpeciesController(
		request: FastifyRequest,
		reply: FastifyReply,
	) {
		const species = await service.getSpeciesService();
		reply.send(species || []);
	}

	async function postNewSpeciesController(
		request: FastifyRequest,
		reply: FastifyReply,
	) {
		const newlyAddedSpecies = await service.addSpeciesService(
			request.body as SpeciesRequest,
		);
		reply.send(newlyAddedSpecies);
	}

	async function getSpeciesByIdController(
		request: FastifyRequest,
		reply: FastifyReply,
	) {
		const { uid } = request.params as { uid: string };
		const species = await service.getSpeciesByIdService(uid);
		return reply.send(species);
	}

	async function removeExistingSpeciesController(
		request: FastifyRequest,
		reply: FastifyReply,
	) {
		const { uid } = request.params as { uid: string };
		await service.removeSpeciesService(uid);
		return reply.code(204).send();
	}

	async function updateExistingSpeciesController(
		request: FastifyRequest,
		reply: FastifyReply,
	) {
		const { uid } = request.params as { uid: string };
		const updatedSpecies = await service.updateSpeciesService(
			uid,
			request.body as SpeciesRequest,
		);
		reply.send(updatedSpecies);
	}

	return {
		getAllSpeciesController,
		postNewSpeciesController,
		getSpeciesByIdController,
		removeExistingSpeciesController,
		updateExistingSpeciesController,
	};
}

export { speciesControllerFactory };
