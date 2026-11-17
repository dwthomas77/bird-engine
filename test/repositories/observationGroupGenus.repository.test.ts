import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { observationGroupGenusRepositoryFactory } from "../../src/repositories/observationGroupGenus.repository.js";
import type { ObservationGroupGenus } from "../../src/types.js";

describe("ObservationGroupGenusRepository", () => {
  let tempDir: string;
  let dataFile: string;
  let repository: ReturnType<typeof observationGroupGenusRepositoryFactory>;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-group-genus-"));
    dataFile = path.join(tempDir, "observationGroupGenus.data.json");
    await writeFile(dataFile, "[]", "utf-8");
    repository = observationGroupGenusRepositoryFactory({ dataDir: tempDir });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("adds a relationship once and removes it", async () => {
    const relationship: ObservationGroupGenus = {
      observationGroupId: "group-1",
      genusId: "genus-1",
    };

    await repository.addRelationship("group-1", "genus-1");
    await repository.addRelationship("group-1", "genus-1");
    expect(await repository.getRelationships()).toEqual([relationship]);

    await repository.removeRelationship("group-1", "genus-1");
    expect(await repository.getRelationships()).toEqual([]);
    await expect(readFile(dataFile, "utf-8")).resolves.toBe("[]");
  });
});
