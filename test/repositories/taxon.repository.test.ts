import { describe, expect, it } from "vitest";
import { taxonRepositoryFactory } from "../../src/repositories/taxon.repository.js";

const repo = taxonRepositoryFactory({ dataDir: "../../data" });

describe("taxonRepository", () => {
  it("lists all taxa and filters by rank", async () => {
    expect((await repo.getTaxa("family")).length).toBe(18);
    expect((await repo.getTaxa("species")).length).toBe(0);
    expect((await repo.getTaxa("genus")).map((t) => t.taxonId)).toContain(
      "cyanocitta",
    );
  });

  it("gets a taxon by id", async () => {
    expect(await repo.getTaxonById("anas")).toMatchObject({
      rank: "genus",
      familyId: "anatidae",
    });
    expect(await repo.getTaxonById("nope")).toBeUndefined();
  });

  it("links families and genera", async () => {
    expect((await repo.getGenera("anatidae")).map((g) => g.taxonId)).toContain(
      "anas",
    );
    expect(await repo.getFamilyByGenusId("anas")).toMatchObject({
      taxonId: "anatidae",
    });
    expect(await repo.getFamilyByGenusId("nope")).toBeUndefined();
    expect(await repo.getGenusById("anas")).toBeDefined();
  });
});
