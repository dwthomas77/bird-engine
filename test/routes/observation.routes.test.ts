import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import type { Observation, ObservationRequest } from "../../src/types.js";
import observationRoutes from "../../src/routes/observation.routes.js";
import {
  ObservationSchema,
  ObservationRequestSchema,
} from "../../src/schema/observation.schema.js";
import { LocationSchema } from "../../src/schema/location.schema.js";
import { observationRepositoryFactory } from "../../src/repositories/observation.repository.js";
import { observationServiceFactory } from "../../src/services/observation.service.js";
import { AppError, errorToProblemDetails } from "../../src/errors.js";

const observation: Observation = {
  observationId: "observation-1",
  speciesId: "species-1",
  locationId: {
    name: "Wetland",
    habitatId: "habitat-1",
  },
  observedAt: "2026-10-01T13:00:00.000Z",
  quantity: 2,
  observerId: "observer-1",
};

const observationRequest: ObservationRequest = {
  speciesId: observation.speciesId,
  locationId: observation.locationId,
  observedAt: observation.observedAt,
  quantity: observation.quantity,
  observerId: observation.observerId,
};

describe("Observation routes", () => {
  let testDir: string;
  let app!: FastifyInstance;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(tmpdir(), "bird-engine-observation-"));
    await fs.writeFile(
      path.join(testDir, "observations.data.json"),
      "[]",
    );
    app = Fastify();
    app.addSchema(LocationSchema);
    app.addSchema(ObservationSchema);
    app.addSchema(ObservationRequestSchema);
    const observationRepository = observationRepositoryFactory({
      dataDir: testDir,
    });
    const observationService = observationServiceFactory({
      observationRepository,
    });
    app.decorate("services", {
      observation: observationService,
    } as FastifyInstance["services"]);
    app.setErrorHandler((error, _request, reply) => {
      if (error instanceof AppError) {
        const problemDetails = errorToProblemDetails(error);
        return reply.status(problemDetails.status).send(problemDetails);
      }
      return reply.status(500).send({ error: "Internal Server Error" });
    });
    await app.register(observationRoutes);
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("returns an empty list", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/observations",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("creates, reads, updates, and deletes an observation", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/observations",
      payload: observationRequest,
    });
    expect(createResponse.statusCode).toBe(200);
    const createdObservation = createResponse.json<Observation>();
    expect(createdObservation).toEqual({
      ...observationRequest,
      observationId: expect.any(String),
    });

    const getResponse = await app.inject({
      method: "GET",
      url: `/observations/${createdObservation.observationId}`,
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual(createdObservation);

    const updatedRequest = {
      ...observationRequest,
      quantity: 3,
      notes: "Three birds observed",
    };
    const updateResponse = await app.inject({
      method: "PUT",
      url: `/observations/${createdObservation.observationId}`,
      payload: updatedRequest,
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toEqual({
      ...updatedRequest,
      observationId: createdObservation.observationId,
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/observations/${createdObservation.observationId}`,
    });
    expect(deleteResponse.statusCode).toBe(204);
    expect(deleteResponse.body).toBe("");
    await expect(
      fs.readFile(path.join(testDir, "observations.data.json"), "utf-8"),
    ).resolves.toBe("[]");
  });

  it("returns not found for an unknown observation", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/observations/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "Observation not found",
    });
  });
});
