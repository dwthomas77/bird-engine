import type { FastifyReply, FastifyRequest } from "fastify";
import type { ObservationRequest } from "../types.js";
import type { ObservationService } from "../services/observation.service.js";

function observationControllerFactory({
  service,
}: {
  service: ObservationService;
}) {
  async function getAllObservationsController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const observations = await service.getObservationsService();
    return reply.send(observations);
  }

  async function postNewObservationController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const observation = await service.addObservationService(
      request.body as ObservationRequest,
    );
    return reply.send(observation);
  }

  async function getObservationByIdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    const observation = await service.getObservationByIdService(uid);
    return reply.send(observation);
  }

  async function removeExistingObservationController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    await service.removeObservationService(uid);
    return reply.code(204).send();
  }

  async function updateExistingObservationController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { uid } = request.params as { uid: string };
    const observation = await service.updateObservationService(
      uid,
      request.body as ObservationRequest,
    );
    return reply.send(observation);
  }

  return {
    getAllObservationsController,
    postNewObservationController,
    getObservationByIdController,
    removeExistingObservationController,
    updateExistingObservationController,
  };
}

export { observationControllerFactory };
