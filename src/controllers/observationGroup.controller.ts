import type { FastifyReply, FastifyRequest } from "fastify";
import type { ObservationGroupRequest } from "../types.js";
import type { ObservationGroupService } from "../services/observationGroup.service.js";

function observationGroupControllerFactory({
  service,
}: {
  service: ObservationGroupService;
}) {
  async function getAllObservationGroupsController(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    return reply.send(await service.getObservationGroupsService());
  }

  async function postNewObservationGroupController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    return reply.send(
      await service.addObservationGroupService(
        request.body as ObservationGroupRequest,
      ),
    );
  }

  async function getObservationGroupByIdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { observationGroupId } = request.params as {
      observationGroupId: string;
    };
    return reply.send(
      await service.getObservationGroupByIdService(observationGroupId),
    );
  }

  async function updateObservationGroupController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { observationGroupId } = request.params as {
      observationGroupId: string;
    };
    return reply.send(
      await service.updateObservationGroupService(
        observationGroupId,
        request.body as ObservationGroupRequest,
      ),
    );
  }

  async function deleteObservationGroupController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { observationGroupId } = request.params as {
      observationGroupId: string;
    };
    await service.removeObservationGroupService(observationGroupId);
    return reply.code(204).send();
  }

  return {
    getAllObservationGroupsController,
    postNewObservationGroupController,
    getObservationGroupByIdController,
    updateObservationGroupController,
    deleteObservationGroupController,
  };
}

export { observationGroupControllerFactory };
