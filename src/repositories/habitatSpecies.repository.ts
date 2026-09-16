import fs from "fs/promises";
import { FromSchema } from "json-schema-to-ts";
import { InternalServerError } from "../errors.js";
import HabitatSpeciesSchema from "./habitatSpecies.schema.js";

export type HabitatSpecies = FromSchema<typeof HabitatSpeciesSchema>;

let cachedHabitatSpecies: HabitatSpecies[] | null = null;

export async function getHabitatSpecies(): Promise<HabitatSpecies[]> {
  if (!cachedHabitatSpecies) {
    const raw = await fs.readFile(new URL("./data/habitatSpecies.json", import.meta.url), "utf-8");
    cachedHabitatSpecies = (JSON.parse(raw) as HabitatSpecies[]) || [];
  }

  return cachedHabitatSpecies;
}

async function writeHabitatSpecies(relationships: HabitatSpecies[]): Promise<void> {
  await fs.writeFile(
    new URL("./data/habitatSpecies.json", import.meta.url),
    JSON.stringify(relationships, null, 2),
    "utf-8"
  );
  cachedHabitatSpecies = relationships;
}

export async function addHabitatSpeciesToRepository(
  relationship: HabitatSpecies
): Promise<HabitatSpecies> {
  try {
    const relationships = await getHabitatSpecies();
    relationships.push(relationship);
    await writeHabitatSpecies(relationships);
    return relationship;
  } catch (error) {
    throw new InternalServerError(
      `Failed to add habitat species relationship: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getHabitatSpeciesByHabitatAndSpecies(
  habitatId: string,
  speciesId: string
): Promise<HabitatSpecies | undefined> {
  return (await getHabitatSpecies()).find(
    (relationship) =>
      relationship.habitatId === habitatId && relationship.speciesId === speciesId
  );
}

export async function deleteHabitatSpeciesFromRepository(
  habitatId: string,
  speciesId: string
): Promise<void> {
  try {
    const relationships = await getHabitatSpecies();
    await writeHabitatSpecies(
      relationships.filter(
        (relationship) =>
          relationship.habitatId !== habitatId || relationship.speciesId !== speciesId
      )
    );
  } catch (error) {
    throw new InternalServerError(
      `Failed to delete habitat species relationship: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateHabitatSpeciesInRepository(
  relationship: HabitatSpecies
): Promise<HabitatSpecies> {
  try {
    const relationships = await getHabitatSpecies();
    const index = relationships.findIndex(
      (item) =>
        item.habitatId === relationship.habitatId && item.speciesId === relationship.speciesId
    );

    if (index === -1) {
      throw new Error("Habitat species relationship not found");
    }

    relationships[index] = relationship;
    await writeHabitatSpecies(relationships);
    return relationship;
  } catch (error) {
    throw new InternalServerError(
      `Failed to update habitat species relationship: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
