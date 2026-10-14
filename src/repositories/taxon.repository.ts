import fs from "fs/promises";
import type {
  Taxon,
  TaxonData,
  TaxonFamily,
  TaxonGenus,
  TaxonRank,
  TaxonSpecies,
} from "../types.js";

export interface TaxonRepository {
  getTaxa(rank?: TaxonRank): Promise<Taxon[]>;
  getTaxonById(taxonId: string): Promise<Taxon | undefined>;
  getFamilies(): Promise<TaxonFamily[]>;
  getFamilyById(familyId: string): Promise<TaxonFamily | undefined>;
  getGenera(familyId?: string): Promise<TaxonGenus[]>;
  getGenusById(genusId: string): Promise<TaxonGenus | undefined>;
  getSpecies(genusId?: string): Promise<TaxonSpecies[]>;
  getSpeciesById(speciesId: string): Promise<TaxonSpecies | undefined>;
}

export function taxonRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): TaxonRepository {
  const fileUrl = new URL(`${dataDir}/taxon.data.json`, import.meta.url);
  let cached: TaxonData | null = null;

  async function load(): Promise<TaxonData> {
    if (!cached) {
      const parsed = JSON.parse(
        await fs.readFile(fileUrl, "utf-8"),
      ) as Partial<TaxonData>;
      cached = {
        families: parsed.families ?? [],
        genera: parsed.genera ?? [],
        species: parsed.species ?? [],
      };
    }
    return cached;
  }

  async function getFamilies() {
    return (await load()).families;
  }

  async function getGenera(familyId?: string) {
    const { genera } = await load();
    return familyId ? genera.filter((g) => g.familyId === familyId) : genera;
  }

  async function getSpecies(genusId?: string) {
    const { species } = await load();
    return genusId ? species.filter((s) => s.genusId === genusId) : species;
  }

  async function getTaxa(rank?: TaxonRank): Promise<Taxon[]> {
    const { families, genera, species } = await load();
    const all: Taxon[] = [...families, ...genera, ...species];
    return rank ? all.filter((t) => t.rank === rank) : all;
  }

  return {
    getTaxa,
    getTaxonById: async (id) => (await getTaxa()).find((t) => t.taxonId === id),
    getFamilies,
    getFamilyById: async (id) =>
      (await getFamilies()).find((f) => f.taxonId === id),
    getGenera,
    getGenusById: async (id) =>
      (await getGenera()).find((g) => g.taxonId === id),
    getSpecies,
    getSpeciesById: async (id) =>
      (await getSpecies()).find((s) => s.taxonId === id),
  };
}
