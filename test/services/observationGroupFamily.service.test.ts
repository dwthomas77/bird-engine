import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { ValidationError } from "../../src/errors.js";

describe("ObservationGroupFamilyService", () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-group-family-"));
    await Promise.all([
      writeFile(
        path.join(tempDir, "observationGroups.data.json"),
        JSON.stringify([{ observationGroupId: "group-1", name: "Waterfowl" }]),
      ),
      writeFile(
        path.join(tempDir, "taxon.data.json"),
        JSON.stringify({
          families: [{ taxonId: "anatidae", rank: "family", name: "Ducks" }],
          genera: [{
            taxonId: "anas",
            rank: "genus",
            name: "Anas",
            familyId: "anatidae",
          }],
          species: [],
        }),
      ),
      writeFile(
        path.join(tempDir, "observationGroupFamily.data.json"),
        JSON.stringify([{ observationGroupId: "group-2", familyId: "anatidae" }]),
      ),
    ]);
    app = await buildApp({ dataFilePath: tempDir });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("persists unique family relationships and removes only the requested pair", async () => {
    const service = app.services.observationGroupFamily;
    const relationship = { observationGroupId: "group-1", familyId: "anatidae" };
    const other = { observationGroupId: "group-2", familyId: "anatidae" };

    await expect(service.addRelationshipService(relationship)).resolves.toEqual(
      relationship,
    );
    await service.addRelationshipService(relationship);
    expect(await service.getRelationshipsService()).toEqual([other, relationship]);
    expect(JSON.parse(await readFile(
      path.join(tempDir, "observationGroupFamily.data.json"),
      "utf-8",
    ))).toEqual([other, relationship]);

    await service.removeRelationshipService("group-1", "anatidae");
    expect(await service.getRelationshipsService()).toEqual([other]);
    expect(JSON.parse(await readFile(
      path.join(tempDir, "observationGroupFamily.data.json"),
      "utf-8",
    ))).toEqual([other]);
  });

  it("rejects unknown groups, unknown families, and IDs of other taxonomy ranks", async () => {
    const service = app.services.observationGroupFamily;

    for (const relationship of [
      { observationGroupId: "missing", familyId: "anatidae" },
      { observationGroupId: "group-1", familyId: "missing" },
      { observationGroupId: "group-1", familyId: "anas" },
    ]) {
      await expect(service.addRelationshipService(relationship)).rejects.toBeInstanceOf(
        ValidationError,
      );
    }

    expect(await service.getRelationshipsService()).toEqual([
      { observationGroupId: "group-2", familyId: "anatidae" },
    ]);
  });
});
