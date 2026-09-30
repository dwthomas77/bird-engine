import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRequest } from "../types.js";
import type { UserService } from "../services/user.service.js";

function userControllerFactory({ service }: { service: UserService }) {
  async function getAllUsersController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    return reply.send(await service.getUsersService());
  }

  async function postNewUserController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    return reply.send(
      await service.addUserService(request.body as UserRequest),
    );
  }

  async function getUserByIdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { userId } = request.params as { userId: string };
    return reply.send(await service.getUserByIdService(userId));
  }

  async function updateUserController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { userId } = request.params as { userId: string };
    return reply.send(
      await service.updateUserService(userId, request.body as UserRequest),
    );
  }

  async function deleteUserController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { userId } = request.params as { userId: string };
    await service.removeUserService(userId);
    return reply.code(204).send();
  }

  return {
    getAllUsersController,
    postNewUserController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
  };
}

export { userControllerFactory };
