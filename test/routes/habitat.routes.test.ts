import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { buildApp } from "../../src/app.js";
import type { Habitat, HabitatRequest } from "../../src/types.js";

const forest: Habitat = {
  habitatId: "1",
  code: "forest",
  name: "Forest",
  description: "A dense forest with tall trees.",
};

const desert: Habitat = {
  habitatId: "2",
  code: "desert",
  name: "Desert",
  description: "A hot and arid desert.",
};

describe("GET /habitats", () => {
  const testDir = path.join(process.cwd(), "test", "temp");

  let app!: FastifyInstance;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });

    await fs.writeFile(path.join(testDir, "habitats.data.json"), "[]");

    app = await buildApp({
      dataFilePath: testDir,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns an empty list", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/habitats",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("returns all habitats", async () => {
    await fs.writeFile(
      path.join(testDir, "habitats.data.json"),
      JSON.stringify([forest, desert]),
    );

    const response = await app.inject({ method: "GET", url: "/habitats" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([forest, desert]);
  });

  it("returns a habitat by id", async () => {
    await fs.writeFile(
      path.join(testDir, "habitats.data.json"),
      JSON.stringify([forest]),
    );

    const response = await app.inject({ method: "GET", url: "/habitats/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(forest);
  });

  it("returns a validation error for an unknown habitat id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/habitats/unknown",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      type: "VALIDATION_ERROR",
      detail: "Habitat not found",
    });
  });

  it("creates a habitat", async () => {
    const creationPayload = {
      code: forest.code,
      name: forest.name,
      description: forest.description,
    };
    const response = await app.inject({
      method: "POST",
      url: "/habitats",
      payload: creationPayload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      code: forest.code,
      name: forest.name,
      description: forest.description,
      habitatId: expect.any(String),
    });
  });

  it("deletes a habitat", async () => {
    await fs.writeFile(
      path.join(testDir, "habitats.data.json"),
      JSON.stringify([forest, desert]),
    );

    const response = await app.inject({ method: "DELETE", url: "/habitats/1" });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("returns not found when deleting an unknown habitat", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/habitats/unknown",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "Habitat not found",
    });
  });

  it("updates a habitat", async () => {
    await fs.writeFile(
      path.join(testDir, "habitats.data.json"),
      JSON.stringify([forest]),
    );

    const updateForestPayload: HabitatRequest = {
      code: forest.code,
      name: forest.name,
      description: forest.description,
    };

    const updatedForest = {
      ...updateForestPayload,
      name: "Old-growth forest",
    };

    const response = await app.inject({
      method: "PUT",
      url: "/habitats/1",
      payload: updatedForest,
    });

    const body: Habitat = await response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      name: updatedForest.name,
      description: updatedForest.description,
      habitatId: expect.any(String),
    });
  });

  it("returns not found when updating an unknown habitat", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/habitats/unknown",
      payload: { ...forest, habitatId: "unknown" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "Habitat not found",
    });
  });
});
