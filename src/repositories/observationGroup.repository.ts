import fs from "node:fs/promises";
import type { ObservationGroup } from "../types.js";
import { InternalServerError } from "../errors.js";

export interface ObservationGroupRepository {
  getObservationGroups(): Promise<ObservationGroup[]>;
  addObservationGroupToRepository(
    group: ObservationGroup,
  ): Promise<ObservationGroup>;
  getObservationGroupById(
    observationGroupId: string,
  ): Promise<ObservationGroup | undefined>;
  updateObservationGroupInRepository(
    group: ObservationGroup,
  ): Promise<ObservationGroup>;
  deleteObservationGroupFromRepository(
    observationGroupId: string,
  ): Promise<void>;
}

export function observationGroupRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): ObservationGroupRepository {
  const fileUrl = new URL(
    `${dataDir}/observationGroups.data.json`,
    import.meta.url,
  );
  let cached: ObservationGroup[] | null = null;

  const message = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  async function read(): Promise<ObservationGroup[]> {
    if (cached) return cached;
    const raw = await fs.readFile(fileUrl, "utf-8");
    cached = JSON.parse(raw) as ObservationGroup[];
    return cached;
  }

  async function write(groups: ObservationGroup[]): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(groups, null, 2), "utf-8");
    cached = groups;
  }

  async function getObservationGroups(): Promise<ObservationGroup[]> {
    try {
      return await read();
    } catch (error) {
      throw new InternalServerError(
        `Failed to get observation groups: ${message(error)}`,
      );
    }
  }

  async function addObservationGroupToRepository(
    group: ObservationGroup,
  ): Promise<ObservationGroup> {
    try {
      const groups = await read();
      groups.push(group);
      await write(groups);
      return group;
    } catch (error) {
      throw new InternalServerError(
        `Failed to add observation group ${group.observationGroupId}: ${message(error)}`,
      );
    }
  }

  async function getObservationGroupById(
    observationGroupId: string,
  ): Promise<ObservationGroup | undefined> {
    try {
      return (await read()).find(
        (group) => group.observationGroupId === observationGroupId,
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to get observation group ${observationGroupId}: ${message(error)}`,
      );
    }
  }

  async function updateObservationGroupInRepository(
    group: ObservationGroup,
  ): Promise<ObservationGroup> {
    try {
      const groups = await read();
      const index = groups.findIndex(
        (item) => item.observationGroupId === group.observationGroupId,
      );
      if (index === -1)
        throw new Error(
          `Observation group ${group.observationGroupId} not found`,
        );
      groups[index] = group;
      await write(groups);
      return group;
    } catch (error) {
      throw new InternalServerError(
        `Failed to update observation group ${group.observationGroupId}: ${message(error)}`,
      );
    }
  }

  async function deleteObservationGroupFromRepository(
    observationGroupId: string,
  ): Promise<void> {
    try {
      const groups = await read();
      await write(
        groups.filter((group) => group.observationGroupId !== observationGroupId),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete observation group ${observationGroupId}: ${message(error)}`,
      );
    }
  }

  return {
    getObservationGroups,
    addObservationGroupToRepository,
    getObservationGroupById,
    updateObservationGroupInRepository,
    deleteObservationGroupFromRepository,
  };
}
