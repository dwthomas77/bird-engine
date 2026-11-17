import fs from "node:fs/promises";
import { InternalServerError } from "../errors.js";
import type { ObservationGroupFamily } from "../types.js";

export interface ObservationGroupFamilyRepository {
  getRelationships(): Promise<ObservationGroupFamily[]>;
  addRelationship(observationGroupId: string, familyId: string, excluded?: boolean): Promise<void>;
  removeRelationship(observationGroupId: string, familyId: string): Promise<void>;
}

export function observationGroupFamilyRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): ObservationGroupFamilyRepository {
  const fileUrl = new URL(
    `${dataDir}/observationGroupFamily.data.json`,
    import.meta.url,
  );
  let cachedRelationships: ObservationGroupFamily[] | null = null;

  const message = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  async function getRelationships(): Promise<ObservationGroupFamily[]> {
    try {
      if (!cachedRelationships) {
        const raw = await fs.readFile(fileUrl, "utf-8");
        cachedRelationships = JSON.parse(raw) as ObservationGroupFamily[];
      }
      return cachedRelationships;
    } catch (error) {
      throw new InternalServerError(
        `Failed to get observation group family relationships: ${message(error)}`,
      );
    }
  }

  async function writeRelationships(
    relationships: ObservationGroupFamily[],
  ): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(relationships, null, 2), "utf-8");
    cachedRelationships = relationships;
  }

  async function addRelationship(
    observationGroupId: string,
    familyId: string,
    excluded?: boolean,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      const existing = relationships.find(
        (relationship) =>
          relationship.observationGroupId === observationGroupId &&
          relationship.familyId === familyId,
      );
      if (!existing || (existing.excluded ?? false) !== (excluded ?? false)) {
        await writeRelationships([
          ...relationships.filter(
            (relationship) =>
              relationship.observationGroupId !== observationGroupId ||
              relationship.familyId !== familyId,
          ),
          { observationGroupId, familyId, ...(excluded === undefined ? {} : { excluded }) },
        ]);
      }
    } catch (error) {
      throw new InternalServerError(
        `Failed to add relationship between observation group ${observationGroupId} and family ${familyId}: ${message(error)}`,
      );
    }
  }

  async function removeRelationship(
    observationGroupId: string,
    familyId: string,
  ): Promise<void> {
    try {
      const relationships = await getRelationships();
      await writeRelationships(
        relationships.filter(
          (relationship) =>
            relationship.observationGroupId !== observationGroupId ||
            relationship.familyId !== familyId,
        ),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to remove relationship between observation group ${observationGroupId} and family ${familyId}: ${message(error)}`,
      );
    }
  }

  return { getRelationships, addRelationship, removeRelationship };
}
