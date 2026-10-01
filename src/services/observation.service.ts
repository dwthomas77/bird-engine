import type { Observation, ObservationRequest } from "../types.js";
import { NotFoundError } from "../errors.js";
import type { ObservationRepository } from "../repositories/observation.repository.js";

export interface ObservationService {
  getObservationsService(): Promise<Observation[]>;
  addObservationService(newObservation: ObservationRequest): Promise<Observation>;
  updateObservationService(
    observationId: string,
    updatedObservation: ObservationRequest,
  ): Promise<Observation>;
  removeObservationService(observationId: string): Promise<void>;
  getObservationByIdService(observationId: string): Promise<Observation>;
}

export function observationServiceFactory({
  observationRepository,
}: {
  observationRepository: ObservationRepository;
}): ObservationService {
  async function getObservationsService(): Promise<Observation[]> {
    return observationRepository.getObservations();
  }

  async function addObservationService(
    newObservation: ObservationRequest,
  ): Promise<Observation> {
    const observation: Observation = {
      ...newObservation,
      observationId: crypto.randomUUID(),
    };
    return observationRepository.addObservationToRepository(observation);
  }

  async function updateObservationService(
    observationId: string,
    updatedObservation: ObservationRequest,
  ): Promise<Observation> {
    const existingObservation =
      await observationRepository.getObservationById(observationId);
    if (!existingObservation) {
      throw new NotFoundError("Observation not found", {
        observationId: "Observation ID does not exist",
      });
    }
    return observationRepository.updateObservationInRepository({
      ...updatedObservation,
      observationId,
    });
  }

  async function removeObservationService(
    observationId: string,
  ): Promise<void> {
    const existingObservation =
      await observationRepository.getObservationById(observationId);
    if (!existingObservation) {
      throw new NotFoundError("Observation not found", {
        observationId: "Observation ID does not exist",
      });
    }
    await observationRepository.deleteObservationFromRepository(observationId);
  }

  async function getObservationByIdService(
    observationId: string,
  ): Promise<Observation> {
    const observation =
      await observationRepository.getObservationById(observationId);
    if (!observation) {
      throw new NotFoundError("Observation not found", {
        observationId: "Observation ID does not exist",
      });
    }
    return observation;
  }

  return {
    getObservationsService,
    addObservationService,
    updateObservationService,
    removeObservationService,
    getObservationByIdService,
  };
}
