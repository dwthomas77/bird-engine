import fs from "fs/promises";
import type { Observation } from "../types.js";
import { InternalServerError } from "../errors.js";

export interface ObservationRepository {
  getObservations(): Promise<Observation[]>;
  addObservationToRepository(newObservation: Observation): Promise<Observation>;
  getObservationById(observationId: string): Promise<Observation | undefined>;
  deleteObservationFromRepository(observationId: string): Promise<void>;
  updateObservationInRepository(updatedObservation: Observation): Promise<Observation>;
}

export function observationRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): ObservationRepository {
  const fileUrl = new URL(`${dataDir}/observations.data.json`, import.meta.url);
  let cachedObservations: Observation[] | null = null;

  async function readObservationsFile(): Promise<Observation[]> {
    const raw = await fs.readFile(fileUrl, "utf-8");
    return (JSON.parse(raw) as Observation[]) || [];
  }

  async function writeObservations(observations: Observation[]): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(observations, null, 2), "utf-8");
    cachedObservations = observations;
  }

  async function getObservations(): Promise<Observation[]> {
    if (!cachedObservations) cachedObservations = await readObservationsFile();
    return cachedObservations;
  }

  async function addObservationToRepository(
    newObservation: Observation,
  ): Promise<Observation> {
    try {
      const observations = await getObservations();
      observations.push(newObservation);
      await writeObservations(observations);
      return newObservation;
    } catch (error) {
      throw new InternalServerError(
        `Failed to add observation ${newObservation.observationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function getObservationById(
    observationId: string,
  ): Promise<Observation | undefined> {
    return (await getObservations()).find(
      (observation) => observation.observationId === observationId,
    );
  }

  async function deleteObservationFromRepository(
    observationId: string,
  ): Promise<void> {
    try {
      const observations = await getObservations();
      await writeObservations(
        observations.filter((item) => item.observationId !== observationId),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete observation ${observationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function updateObservationInRepository(
    updatedObservation: Observation,
  ): Promise<Observation> {
    try {
      const observations = await getObservations();
      const index = observations.findIndex(
        (item) => item.observationId === updatedObservation.observationId,
      );
      if (index === -1) {
        throw new Error(
          `Observation with id ${updatedObservation.observationId} not found`,
        );
      }
      observations[index] = updatedObservation;
      await writeObservations(observations);
      return updatedObservation;
    } catch (error) {
      throw new InternalServerError(
        `Failed to update observation ${updatedObservation.observationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    getObservations,
    addObservationToRepository,
    getObservationById,
    deleteObservationFromRepository,
    updateObservationInRepository,
  };
}