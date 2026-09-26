// habitat.repository.test.ts
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, afterEach, describe, it, expect } from "vitest";
import {
  habitatRepositoryFactory,
  HabitatRepository,
} from "../../src/repositories/habitat.repository.js";
import type { Habitat } from "../../src/types.js";

let tempDir: string;
let dataFile: string;

export const testHabitat: Habitat = {
  habitatId: "1",
  habitatName: "Forest",
  habitatDescription: "A dense forest with tall trees.",
};

export const testHabitat2: Habitat = {
  habitatId: "2",
  habitatName: "Desert",
  habitatDescription: "A hot and arid desert.",
};

describe("HabitatRepository", () => {
  let repository: HabitatRepository;
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-"));
    dataFile = path.join(tempDir, "habitats.data.json");
    await writeFile(dataFile, "[]", "utf8");
    repository = habitatRepositoryFactory({ dataDir: tempDir });
  });

  afterEach(async () => {
    await rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  async function seedHabitats(habitats: Habitat[]) {
    await writeFile(
      dataFile,
      JSON.stringify(habitats, null, 2),
      "utf8",
    );
  }

  it("retrieves an empty list of habitats", async () => {
    const habitats = await repository.getHabitats();
    expect(habitats).toEqual([]);
  });

  it("retrieves a list of habitats", async () => {
    await seedHabitats([testHabitat, testHabitat2]);

    const habitats = await repository.getHabitats();
    expect(habitats).toHaveLength(2);
    expect(habitats[0].habitatId).toBe("1");
    expect(habitats[0].habitatName).toBe("Forest");
    expect(habitats[0].habitatDescription).toBe(
      "A dense forest with tall trees.",
    );
    expect(habitats[1].habitatId).toBe("2");
    expect(habitats[1].habitatName).toBe("Desert");
    expect(habitats[1].habitatDescription).toBe("A hot and arid desert.");
  });

  it("retrieves a habitat by id", async () => {
    await seedHabitats([testHabitat, testHabitat2]);

    const habitat = await repository.getHabitatById("1");
    expect(habitat).toEqual(testHabitat);

    const habitat2 = await repository.getHabitatById("2");
    expect(habitat2).toEqual(testHabitat2);

    const nonExistentHabitat = await repository.getHabitatById("3");
    expect(nonExistentHabitat).toBeUndefined();
  });

  it("creates a habitat", async () => {
    await repository.addHabitatToRepository(testHabitat);

    const habitats = await repository.getHabitats();

    expect(habitats).toHaveLength(1);
    expect(habitats[0].habitatId).toBe("1");
    expect(habitats[0].habitatName).toBe("Forest");
    expect(habitats[0].habitatDescription).toBe(
      "A dense forest with tall trees.",
    );
  });

  it("deletes a habitat", async () => {
    await seedHabitats([testHabitat, testHabitat2]);

    await repository.deleteHabitatFromRepository("1");

    const habitats = await repository.getHabitats();
    expect(habitats).toHaveLength(1);
    expect(habitats[0].habitatId).toBe("2");
  });

  it("updates a habitat", async () => {
    await seedHabitats([testHabitat]);
    const updatedHabitat: Habitat = {
      habitatId: "1",
      habitatName: "Updated Forest",
      habitatDescription: "An updated description.",
    };
    await repository.updateHabitatInRepository(updatedHabitat);
    const habitats = await repository.getHabitats();
    expect(habitats).toHaveLength(1);
    expect(habitats[0].habitatId).toBe("1");
    expect(habitats[0].habitatName).toBe("Updated Forest");
    expect(habitats[0].habitatDescription).toBe("An updated description.");
  });
});
