import type { FastifyReply, FastifyRequest } from "fastify";
import type { BirdService } from "../services/bird.service.js";

function birdControllerFactory({ service }: { service: BirdService }) {
  async function getBirdController(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const bird = await service.getBird();
    return reply.send(bird);
  }

  return { getBirdController };
}

export { birdControllerFactory };
