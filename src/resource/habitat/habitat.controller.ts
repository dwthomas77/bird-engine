import { FastifyRequest, FastifyReply } from "fastify";
import {
  getHabitatsService,
  addHabitatService,
  removeHabitatService,
  getHabitatByIdService,
  updateHabitatService,
} from "./habitat.service.js";
import type { Habitat } from "../../types.js";
import { ValidationError } from "../../errors.js";


async function getAllHabitatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  //const habitats = await habitatService.getAllHabitats();
  const habitats = await getHabitatsService();
  reply.send(habitats || []);
}

async function postNewHabitatController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
    const newlyAddedHabitat = await addHabitatService(request.body as Habitat);
    reply.send(newlyAddedHabitat);

}

async function getHabitatByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { uid } = request.params as { uid: string };
  const habitat = await getHabitatByIdService(uid);
  return reply.send(habitat);
}

async function removeExistingHabitatController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
    const { uid } = request.params as { uid: string };
    await removeHabitatService(uid);
    return reply.code(204).send();
}

async function updateExistingHabitatController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
    const { uid } = request.params as { uid: string };
    const { habitatId } = request.body as Habitat;
    if (uid !== habitatId) {
        throw new ValidationError("Habitat ID in URL does not match ID in request body", {
            habitatId: "Habitat ID in URL does not match ID in request body",
        });
    }
    const updatedHabitat = await updateHabitatService(request.body as Habitat);
    reply.send(updatedHabitat);
}

export {
  getAllHabitatsController,
  postNewHabitatController,
  getHabitatByIdController,
  removeExistingHabitatController,
  updateExistingHabitatController
};
