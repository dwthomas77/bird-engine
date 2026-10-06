import type { FastifyReply, FastifyRequest } from "fastify";
import type { JournalRequest } from "../types.js";
import type { JournalService } from "../services/journal.service.js";

function journalControllerFactory({ service }: { service: JournalService }) {
  async function getAllJournalsController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { userId } = request.query as { userId?: string };
    return reply.send(await service.getJournalsService(userId));
  }

  async function postNewJournalController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    return reply.send(
      await service.addJournalService(request.body as JournalRequest),
    );
  }

  async function getJournalByIdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { journalId } = request.params as { journalId: string };
    return reply.send(await service.getJournalByIdService(journalId));
  }

  async function updateJournalController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { journalId } = request.params as { journalId: string };
    return reply.send(
      await service.updateJournalService(
        journalId,
        request.body as JournalRequest,
      ),
    );
  }

  async function deleteJournalController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { journalId } = request.params as { journalId: string };
    await service.removeJournalService(journalId);
    return reply.code(204).send();
  }

  return {
    getAllJournalsController,
    postNewJournalController,
    getJournalByIdController,
    updateJournalController,
    deleteJournalController,
  };
}

export { journalControllerFactory };
