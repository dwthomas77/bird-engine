import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { NotFoundError } from "../../src/errors.js";
import { schemaRef } from "../../src/schema/ids.js";

describe("Observation group membership", () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof buildApp>>;
  const species = [
    { speciesId: "s1", genusId: "g1" },
    { speciesId: "s2", genusId: "g1" },
    { speciesId: "s3", genusId: "g2" },
    { speciesId: "s4", genusId: "g2" },
    { speciesId: "s5", genusId: "g3" },
    { speciesId: "s6", genusId: "g4" },
  ];

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-membership-"));
    await Promise.all([
      writeFile(path.join(tempDir, "observationGroups.data.json"), JSON.stringify([
        { observationGroupId: "group-1", name: "One" },
        { observationGroupId: "group-2", name: "Two" },
      ])),
      writeFile(path.join(tempDir, "species.data.json"), JSON.stringify(species)),
      writeFile(path.join(tempDir, "taxon.data.json"), JSON.stringify({
        families: [
          { taxonId: "f1", rank: "family", name: "One" },
          { taxonId: "f2", rank: "family", name: "Two" },
        ],
        genera: [
          { taxonId: "g1", rank: "genus", name: "One", familyId: "f1" },
          { taxonId: "g2", rank: "genus", name: "Two", familyId: "f1" },
          { taxonId: "g3", rank: "genus", name: "Three", familyId: "f2" },
          { taxonId: "g4", rank: "genus", name: "Four", familyId: "f2" },
        ],
        species: [],
      })),
      ...["Family", "Genus", "Species"].map((kind) =>
        writeFile(path.join(tempDir, `observationGroup${kind}.data.json`), "[]"),
      ),
    ]);
    app = await buildApp({ dataFilePath: tempDir });
    for (const kind of ["family", "genus", "species"]) {
      app.post(`/test-${kind}`, {
        schema: { body: { $ref: schemaRef(`observation-group-${kind}`) } },
      }, async (request) => request.body);
    }
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("uses the most specific rule and only rules for the requested group", async () => {
    const { observationGroupFamily: family, observationGroupGenus: genus,
      observationGroupSpecies: direct, observationGroupMembership: membership } = app.services;
    await family.addRelationshipService({ observationGroupId: "group-1", familyId: "f1" });
    await genus.addRelationshipService({ observationGroupId: "group-1", genusId: "g1", excluded: true });
    await direct.addRelationshipService({ observationGroupId: "group-1", speciesId: "s1", excluded: false });
    await direct.addRelationshipService({ observationGroupId: "group-1", speciesId: "s3", excluded: true });
    await family.addRelationshipService({ observationGroupId: "group-1", familyId: "f2", excluded: true });
    await genus.addRelationshipService({ observationGroupId: "group-1", genusId: "g3" });
    await direct.addRelationshipService({ observationGroupId: "group-2", speciesId: "s6" });

    expect((await membership.getSpeciesForGroup("group-1")).map((s) => s.speciesId))
      .toEqual(["s1", "s4", "s5"]);
    expect((await membership.getSpeciesForGroup("group-2")).map((s) => s.speciesId))
      .toEqual(["s6"]);
    await expect(membership.getSpeciesForGroup("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates and removes rules without duplicates, including after reload", async () => {
    const { observationGroupFamily: family, observationGroupGenus: genus,
      observationGroupSpecies: direct, observationGroupMembership: membership } = app.services;
    const familyRule = { observationGroupId: "group-1", familyId: "f1" };
    const genusRule = { observationGroupId: "group-1", genusId: "g1" };
    const speciesRule = { observationGroupId: "group-1", speciesId: "s1" };

    await family.addRelationshipService(familyRule);
    await genus.addRelationshipService(genusRule);
    await direct.addRelationshipService(speciesRule);
    await family.addRelationshipService({ ...familyRule, excluded: true });
    await genus.addRelationshipService({ ...genusRule, excluded: true });
    await direct.addRelationshipService({ ...speciesRule, excluded: true });
    for (const [kind, rule] of [
      ["Family", familyRule], ["Genus", genusRule], ["Species", speciesRule],
    ] as const) {
      expect(JSON.parse(await readFile(
        path.join(tempDir, `observationGroup${kind}.data.json`), "utf-8",
      ))).toEqual([{ ...rule, excluded: true }]);
    }
    expect(await membership.getSpeciesForGroup("group-1")).toEqual([]);

    await direct.addRelationshipService(speciesRule);
    expect((await membership.getSpeciesForGroup("group-1")).map((s) => s.speciesId))
      .toEqual(["s1"]);
    await direct.removeRelationshipService("group-1", "s1");
    await genus.removeRelationshipService("group-1", "g1");
    await family.addRelationshipService(familyRule);

    const reloaded = await buildApp({ dataFilePath: tempDir });
    try {
      expect((await reloaded.services.observationGroupMembership.getSpeciesForGroup("group-1"))
        .map((s) => s.speciesId)).toEqual(["s1", "s2", "s3", "s4"]);
    } finally {
      await reloaded.close();
    }
  });

  it("accepts boolean exclusions and rejects non-boolean values in all schemas", async () => {
    for (const [kind, id] of [
      ["family", { familyId: "f1" }],
      ["genus", { genusId: "g1" }],
      ["species", { speciesId: "s1" }],
    ] as const) {
      const payload = { observationGroupId: "group-1", ...id };
      expect((await app.inject({
        method: "POST", url: `/test-${kind}`, payload: { ...payload, excluded: true },
      })).statusCode).toBe(200);
      expect((await app.inject({
        method: "POST", url: `/test-${kind}`, payload: { ...payload, excluded: {} },
      })).statusCode).toBe(400);
    }
  });

  it("replaces species rules with inclusive rules when synchronizing", async () => {
    const repository = app.repositories.observationGroupSpecies;
    await repository.addRelationship("group-1", "s1", true);
    await repository.addRelationship("group-2", "s2", true);
    await repository.synchronizeRelationships("group-1", ["s1", "s1", "s3"]);

    expect(await repository.getRelationships()).toEqual([
      { observationGroupId: "group-2", speciesId: "s2", excluded: true },
      { observationGroupId: "group-1", speciesId: "s1" },
      { observationGroupId: "group-1", speciesId: "s3" },
    ]);
  });
});
