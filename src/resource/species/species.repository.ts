import fs from "fs/promises";
import type { SpeciesEntity } from "../../types.js";
import { InternalServerError } from "../../errors.js";

let cachedSpecies: SpeciesEntity[] | null = null;

async function readSpeciesFile(): Promise<SpeciesEntity[]> {
  const raw = await fs.readFile(new URL("./data/species.json", import.meta.url), "utf-8");
  return (JSON.parse(raw) as SpeciesEntity[]) || [];
}

export async function getSpecies(): Promise<SpeciesEntity[]> {
  if (!cachedSpecies) cachedSpecies = await readSpeciesFile();
  return cachedSpecies;
}

async function writeSpecies(species: SpeciesEntity[]): Promise<void> {
  await fs.writeFile(new URL("./data/species.json", import.meta.url), JSON.stringify(species, null, 2), "utf-8");
  cachedSpecies = species;
}

export async function addSpeciesToRepository(newSpecies: SpeciesEntity): Promise<SpeciesEntity> {
  try {
    const species = await getSpecies();
    species.push(newSpecies);
    await writeSpecies(species);
    return newSpecies;
  } catch (error) {
    throw new InternalServerError(`Failed to add species ${newSpecies.speciesId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getSpeciesById(speciesId: string): Promise<SpeciesEntity | undefined> {
  return (await getSpecies()).find((species) => species.speciesId === speciesId);
}

export async function deleteSpeciesFromRepository(speciesId: string): Promise<void> {
  try {
    const species = await getSpecies();
    await writeSpecies(species.filter((item) => item.speciesId !== speciesId));
  } catch (error) {
    throw new InternalServerError(`Failed to delete species ${speciesId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateSpeciesInRepository(updatedSpecies: SpeciesEntity): Promise<SpeciesEntity> {
  try {
    const species = await getSpecies();
    const index = species.findIndex((item) => item.speciesId === updatedSpecies.speciesId);
    if (index === -1) throw new Error(`Species with id ${updatedSpecies.speciesId} not found`);
    species[index] = updatedSpecies;
    await writeSpecies(species);
    return updatedSpecies;
  } catch (error) {
    throw new InternalServerError(`Failed to update species ${updatedSpecies.speciesId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}