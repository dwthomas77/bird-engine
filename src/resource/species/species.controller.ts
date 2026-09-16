import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateSpecies, Species } from "../../types.js";
import { ValidationError } from "../../errors.js";
import {
  addSpeciesService,
  getSpeciesByIdService,
  getSpeciesService,
  removeSpeciesService,
  updateSpeciesService,
} from "./species.service.js";

export async function getAllSpeciesController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(await getSpeciesService());
}
export async function postNewSpeciesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const newSpecies = await addSpeciesService(request.body as CreateSpecies);
  return reply.send(newSpecies);
}
export async function getSpeciesByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { uid } = request.params as { uid: string };
  return reply.send(await getSpeciesByIdService(uid));
}
export async function removeExistingSpeciesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { uid } = request.params as { uid: string };
  await removeSpeciesService(uid);
  return reply.code(204).send();
}
export async function updateExistingSpeciesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { uid } = request.params as { uid: string };
  const species = request.body as Species;
  if (uid !== species.speciesId)
    throw new ValidationError(
      "Species ID in URL does not match ID in request body",
      { speciesId: "Species IDs must match" },
    );
  return reply.send(await updateSpeciesService(species));
}
