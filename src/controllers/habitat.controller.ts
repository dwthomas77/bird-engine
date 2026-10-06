import { FastifyRequest, FastifyReply } from "fastify";
import type { HabitatRequest } from "../types.js";
import type { HabitatService } from "../services/habitat.service.js";

function habitatControllerFactory({ service }: { service: HabitatService }) {
  async function getAllHabitatsController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { code, parentId } = request.query as {
      code?: string;
      parentId?: string;
    };
    // "null" or an empty value selects habitats with no parent
    const habitats = await service.getHabitatsService({
      code,
      parentId:
        parentId === "null" || parentId === "" ? null : parentId,
    });
    reply.send(habitats || []);
  }

  async function postNewHabitatController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const newlyAddedHabitat = await service.addHabitatService(
      request.body as HabitatRequest,
    );
    reply.send(newlyAddedHabitat);
  }

  async function getHabitatByIdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    const habitat = await service.getHabitatByIdService(uid);
    return reply.send(habitat);
  }

  async function removeExistingHabitatController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    await service.removeHabitatService(uid);
    return reply.code(204).send();
  }

  async function updateExistingHabitatController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    const updatedHabitat = await service.updateHabitatService(
      uid,
      request.body as HabitatRequest,
    );
    reply.send(updatedHabitat);
  }

  return {
    getAllHabitatsController,
    postNewHabitatController,
    getHabitatByIdController,
    removeExistingHabitatController,
    updateExistingHabitatController,
  };
}

export { habitatControllerFactory };
