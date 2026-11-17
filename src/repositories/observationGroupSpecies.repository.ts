import fs from "node:fs/promises";
import { InternalServerError } from "../errors.js";
import type { ObservationGroupSpecies } from "../types.js";

export interface ObservationGroupSpeciesRepository {
  getRelationships(): Promise<ObservationGroupSpecies[]>;
  addRelationship(
    observationGroupId: string,
    speciesId: string,
  ): Promise<void>;
  removeRelationship(
    observationGroupId: string,
    speciesId: string,
  ): Promise<void>;
  synchronizeRelationships(
    observationGroupId: string,
    speciesIds: string[],
  ): Promise<void>;
}

export function observationGroupSpeciesRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): ObservationGroupSpeciesRepository {
  const fileUrl = new URL(
    `${dataDir}/observationGroupSpecies.data.json`,
    import.meta.url,
  );
  let cachedRelationships: ObservationGroupSpecies[] | null = null;

  const message = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  async function readRelationshipsFile(): Promise<ObservationGroupSpecies[]> {
    const raw = await fs.readFile(fileUrl, "utf-8");
    return JSON.parse(raw) as ObservationGroupSpecies[];
  }

  async function writeRelationships(
    relationships: ObservationGroupSpecies[],
  ): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(relationships, null, 2), "utf-8");
    cachedRelationships = relationships;
  }

  async function getRelationships(): Promise<ObservationGroupSpecies[]> {
    try {
      if (!cachedRelationships) {
        cachedRelationships = await readRelationshipsFile();
      }
      return cachedRelationships;
    } catch (error) {
      throw new InternalServerError(
        `Failed to get observation group species relationships: ${message(error)}`,
      );
    }
  }

  async function addRelationship(
    observationGroupId: string,
    speciesId: string,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      const alreadyExists = relationships.some(
        (relationship) =>
          relationship.observationGroupId === observationGroupId &&
          relationship.speciesId === speciesId,
      );
      if (!alreadyExists) {
        await writeRelationships([
          ...relationships,
          { observationGroupId, speciesId },
        ]);
      }
    } catch (error) {
      throw new InternalServerError(
        `Failed to add relationship between observation group ${observationGroupId} and species ${speciesId}: ${message(error)}`,
      );
    }
  }

  async function removeRelationship(
    observationGroupId: string,
    speciesId: string,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      await writeRelationships(
        relationships.filter(
          (relationship) =>
            relationship.observationGroupId !== observationGroupId ||
            relationship.speciesId !== speciesId,
        ),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to remove relationship between observation group ${observationGroupId} and species ${speciesId}: ${message(error)}`,
      );
    }
  }

  async function synchronizeRelationships(
		observationGroupId: string,
		speciesIds: string[],
	): Promise<void> {
		try {
			const relationships = await getRelationships();
			const retainedRelationships = relationships.filter(
				(relationship) =>
				relationship.observationGroupId !== observationGroupId ||
				speciesIds.includes(relationship.speciesId),
			);
			const replacementRelationships = speciesIds
				.filter(
					(speciesId) =>
						!retainedRelationships.some(
							(relationship) =>
								relationship.observationGroupId === observationGroupId &&
								relationship.speciesId === speciesId,
						),
				)
				.map((speciesId) => ({
					observationGroupId,
					speciesId,
				}));
			await writeRelationships([
				...retainedRelationships,
				...replacementRelationships,
			]);
		} catch (error) {
			throw new InternalServerError(
				`Failed to replace species for observation group ${observationGroupId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

  return {
    getRelationships,
    addRelationship,
    removeRelationship,
    synchronizeRelationships,
  };
}
