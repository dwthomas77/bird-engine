import { describe, expect, it } from "vitest";
import { taxonRepositoryFactory } from "../../src/repositories/taxon.repository.js";

const repo = taxonRepositoryFactory({ dataDir: "../../data" });

describe("taxonRepository", () => {
  it("lists all taxa and filters by rank", async () => {
    expect((await repo.getTaxa("family")).length).toBe(18);
    expect((await repo.getTaxa("species")).length).toBe(60);
    expect((await repo.getTaxa("genus")).map((t) => t.taxonId)).toContain(
      "cyanocitta",
    );
  });

  it("gets a taxon by id", async () => {
    expect(await repo.getTaxonById("mallard")).toMatchObject({
      rank: "species",
      name: "Mallard",
    });
    expect(await repo.getTaxonById("nope")).toBeUndefined();
  });

  it("links families, genera and species", async () => {
    expect((await repo.getGenera("anatidae")).map((g) => g.taxonId)).toContain(
      "anas",
    );
    expect((await repo.getSpecies("anas"))[0]).toMatchObject({
      taxonId: "mallard",
      scientificName: "Anas platyrhynchos",
      genusId: "anas",
      familyId: "anatidae",
    });
    expect(await repo.getFamilyById("corvidae")).toBeDefined();
    expect(await repo.getGenusById("anas")).toBeDefined();
    expect(await repo.getSpeciesById("blue-jay")).toBeDefined();
  });
});
