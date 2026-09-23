import fs from "fs/promises";
import type { Species } from "../types.js";
import { InternalServerError } from "../errors.js";

export interface SpeciesRepository {
  getSpecies(): Promise<Species[]>;
  addSpeciesToRepository(newSpecies: Species): Promise<Species>;
  getSpeciesById(speciesId: string): Promise<Species | undefined>;
  deleteSpeciesFromRepository(habitatId: string): Promise<void>;
  updateSpeciesInRepository(
    uid: string,
    updatedSpecies: Species,
  ): Promise<Species>;
}

export function habitatRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): SpeciesRepository {
  const fileUrl = new URL(`${dataDir}/species.data.json`, import.meta.url);
  let cachedSpecies: Species[] | null = null;

  async function readSpeciesFile(): Promise<Species[]> {
    const raw = await fs.readFile(fileUrl, "utf-8");
    return (JSON.parse(raw) as Species[]) || [];
  }

  async function writeSpecies(species: Species[]): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(species, null, 2), "utf-8");
    cachedSpecies = species;
  }

  async function getSpecies(): Promise<Species[]> {
    if (!cachedSpecies) cachedSpecies = await readSpeciesFile();
    return cachedSpecies;
  }

  async function addSpeciesToRepository(newSpecies: Species): Promise<Species> {
    try {
      const species = await getSpecies();
      species.push(newSpecies);
      await writeSpecies(species);
      return newSpecies;
    } catch (error) {
      throw new InternalServerError(
        `Failed to add species ${newSpecies.speciesId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function getSpeciesById(
    speciesId: string,
  ): Promise<Species | undefined> {
    return (await getSpecies()).find(
      (species) => species.speciesId === speciesId,
    );
  }

  async function deleteSpeciesFromRepository(speciesId: string): Promise<void> {
    try {
      const species = await getSpecies();
      await writeSpecies(
        species.filter((item) => item.speciesId !== speciesId),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete species ${speciesId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function updateSpeciesInRepository(
    uid: string,
    updatedSpecies: Species,
  ): Promise<Species> {
    try {
      const species = await getSpecies();
      const index = species.findIndex(
        (item) => item.speciesId === uid,
      );
      if (index === -1)
        throw new Error(
          `Species with id ${updatedSpecies.speciesId} not found`,
        );
      species[index] = updatedSpecies;
      await writeSpecies(species);
      return updatedSpecies;
    } catch (error) {
      throw new InternalServerError(
        `Failed to update species ${updatedSpecies.speciesId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    getSpecies,
    addSpeciesToRepository,
    getSpeciesById,
    deleteSpeciesFromRepository,
    updateSpeciesInRepository,
  };
}
