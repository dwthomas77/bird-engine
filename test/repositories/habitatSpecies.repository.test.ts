import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  habitatSpeciesRepositoryFactory,
  type HabitatSpeciesRepository,
} from "../../src/repositories/habitatSpecies.repository.js";
import type { HabitatSpeciesRelationship } from "../../src/types.js";

let tempDir: string;
let dataFile: string;

const relationship: HabitatSpeciesRelationship = {
  habitatId: "habitat-1",
  speciesId: "species-1",
};

const relationship2: HabitatSpeciesRelationship = {
  habitatId: "habitat-2",
  speciesId: "species-1",
};

const relationship3: HabitatSpeciesRelationship = {
  habitatId: "habitat-1",
  speciesId: "species-2",
};

describe("HabitatSpeciesRepository", () => {
  let repository: HabitatSpeciesRepository;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-"));
    dataFile = path.join(tempDir, "habitatSpecies.data.json");
    await writeFile(dataFile, "[]", "utf8");
    repository = habitatSpeciesRepositoryFactory({ dataDir: tempDir });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  async function seedRelationships(
    relationships: HabitatSpeciesRelationship[],
  ) {
    await writeFile(dataFile, JSON.stringify(relationships, null, 2), "utf8");
  }

  it("retrieves relationships", async () => {
    await seedRelationships([relationship, relationship2, relationship3]);

    expect(await repository.getRelationships()).toEqual([
      relationship,
      relationship2,
      relationship3,
    ]);
  });

  it("adds a relationship without duplicating an existing relationship", async () => {
    await repository.addRelationship("habitat-1", "species-1");
    await repository.addRelationship("habitat-1", "species-1");

    expect(await repository.getRelationships()).toEqual([relationship]);
  });

  it("removes a relationship", async () => {
    await seedRelationships([relationship, relationship2]);

    await repository.removeRelationship("habitat-1", "species-1");

    expect(await repository.getRelationships()).toEqual([relationship2]);
  });

  it("synchronizes habitats for one species and preserves other species", async () => {
    await seedRelationships([relationship, relationship2, relationship3]);

    await repository.synchronizeHabitats("species-1", [
      "habitat-2",
      "habitat-3",
    ]);

    expect(await repository.getRelationships()).toEqual([
      relationship2,
      relationship3,
      { habitatId: "habitat-3", speciesId: "species-1" },
    ]);
  });
});