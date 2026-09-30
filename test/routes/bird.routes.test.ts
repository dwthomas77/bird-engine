import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { buildApp } from "../../src/app.js";
import type { Species } from "../../src/types.js";

const peregrine: Species = {
  speciesId: "species-1",
  speciesName: "Peregrine Falcon",
  family: "Falconidae",
  genus: "Falco",
  localeName: "Peregrine",
  lengthMin: 34,
  lengthMax: 58,
  weightMin: 0.7,
  weightMax: 1.5,
  wingspanMin: 74,
  wingspanMax: 120,
};

describe("GET /bird", () => {
  const testDir = path.join(process.cwd(), "test", "temp", "bird");
  let app!: FastifyInstance;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(testDir, "species.data.json"), "[]"),
      fs.writeFile(path.join(testDir, "habitats.data.json"), "[]"),
      fs.writeFile(path.join(testDir, "habitatSpecies.data.json"), "[]"),
    ]);
    app = await buildApp({ dataFilePath: testDir });
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns a randomly generated bird", async () => {
    await fs.writeFile(
      path.join(testDir, "species.data.json"),
      JSON.stringify([peregrine]),
    );

    const response = await app.inject({ method: "GET", url: "/bird" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      birdId: expect.any(String),
      speciesId: peregrine.speciesId,
      speciesName: peregrine.speciesName,
      localeName: peregrine.localeName,
      genus: peregrine.genus,
      family: peregrine.family,
      sex: expect.stringMatching(/^(male|female)$/),
    });
    expect(response.json().length).toBeGreaterThanOrEqual(peregrine.lengthMin);
    expect(response.json().length).toBeLessThanOrEqual(peregrine.lengthMax);
    expect(response.json().wingspan).toBeGreaterThanOrEqual(
      peregrine.wingspanMin,
    );
    expect(response.json().wingspan).toBeLessThanOrEqual(peregrine.wingspanMax);
    expect(response.json().weight).toBeGreaterThanOrEqual(peregrine.weightMin);
    expect(response.json().weight).toBeLessThanOrEqual(peregrine.weightMax);
  });

  it("returns not found when there are no species", async () => {
    const response = await app.inject({ method: "GET", url: "/bird" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "No species available to create a bird",
    });
  });
});
