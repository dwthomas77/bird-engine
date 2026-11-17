import fs from "node:fs/promises";
import { InternalServerError } from "../errors.js";
import type { ObservationGroupGenus } from "../types.js";

export interface ObservationGroupGenusRepository {
  getRelationships(): Promise<ObservationGroupGenus[]>;
  addRelationship(
    observationGroupId: string,
    genusId: string,
  ): Promise<void>;
  removeRelationship(
    observationGroupId: string,
    genusId: string,
  ): Promise<void>;
}

export function observationGroupGenusRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): ObservationGroupGenusRepository {
  const fileUrl = new URL(
    `${dataDir}/observationGroupGenus.data.json`,
    import.meta.url,
  );
  let cachedRelationships: ObservationGroupGenus[] | null = null;

  const message = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  async function readRelationshipsFile(): Promise<ObservationGroupGenus[]> {
    const raw = await fs.readFile(fileUrl, "utf-8");
    return JSON.parse(raw) as ObservationGroupGenus[];
  }

  async function writeRelationships(
    relationships: ObservationGroupGenus[],
  ): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(relationships, null, 2), "utf-8");
    cachedRelationships = relationships;
  }

  async function getRelationships(): Promise<ObservationGroupGenus[]> {
    try {
      if (!cachedRelationships) {
        cachedRelationships = await readRelationshipsFile();
      }
      return cachedRelationships;
    } catch (error) {
      throw new InternalServerError(
        `Failed to get observation group genus relationships: ${message(error)}`,
      );
    }
  }

  async function addRelationship(
    observationGroupId: string,
    genusId: string,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      const alreadyExists = relationships.some(
        (relationship) =>
          relationship.observationGroupId === observationGroupId &&
          relationship.genusId === genusId,
      );
      if (!alreadyExists) {
        await writeRelationships([
          ...relationships,
          { observationGroupId, genusId },
        ]);
      }
    } catch (error) {
      throw new InternalServerError(
        `Failed to add relationship between observation group ${observationGroupId} and genus ${genusId}: ${message(error)}`,
      );
    }
  }

  async function removeRelationship(
    observationGroupId: string,
    genusId: string,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      await writeRelationships(
        relationships.filter(
          (relationship) =>
            relationship.observationGroupId !== observationGroupId ||
            relationship.genusId !== genusId,
        ),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to remove relationship between observation group ${observationGroupId} and genus ${genusId}: ${message(error)}`,
      );
    }
  }

  return {
    getRelationships,
    addRelationship,
    removeRelationship,
  };
}
