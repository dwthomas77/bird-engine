import { ValidationError } from "../errors.js";
import type { ObservationGroupSpecies } from "../types.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type { ObservationGroupSpeciesRepository } from "../repositories/observationGroupSpecies.repository.js";
import type { SpeciesRepository } from "../repositories/species.repository.js";

export interface ObservationGroupSpeciesService {
  getRelationshipsService(): Promise<ObservationGroupSpecies[]>;
  addRelationshipService(
    relationship: ObservationGroupSpecies,
  ): Promise<ObservationGroupSpecies>;
  removeRelationshipService(
    observationGroupId: string,
    speciesId: string,
  ): Promise<void>;
}

export function observationGroupSpeciesServiceFactory({
  observationGroupSpeciesRepository,
  observationGroupRepository,
  speciesRepository,
}: {
  observationGroupSpeciesRepository: ObservationGroupSpeciesRepository;
  observationGroupRepository: ObservationGroupRepository;
  speciesRepository: SpeciesRepository;
}): ObservationGroupSpeciesService {
  return {
    async getRelationshipsService(): Promise<ObservationGroupSpecies[]> {
      return observationGroupSpeciesRepository.getRelationships();
    },

    async addRelationshipService(
      relationship: ObservationGroupSpecies,
    ): Promise<ObservationGroupSpecies> {
      const observationGroup = await observationGroupRepository.getObservationGroupById(
        relationship.observationGroupId,
      );
      if (!observationGroup) {
        throw new ValidationError(
          `Observation group not found for ID: ${relationship.observationGroupId}`,
          {
            observationGroupId: `Observation group not found for ID: ${relationship.observationGroupId}`,
          },
        );
      }

      const species = await speciesRepository.getSpeciesById(
        relationship.speciesId,
      );
      if (!species) {
        throw new ValidationError(
          `Species not found for ID: ${relationship.speciesId}`,
          {
            speciesId: `Species not found for ID: ${relationship.speciesId}`,
          },
        );
      }

      await observationGroupSpeciesRepository.addRelationship(
        relationship.observationGroupId,
        relationship.speciesId,
        relationship.excluded,
      );
      return relationship;
    },

    async removeRelationshipService(
      observationGroupId: string,
      speciesId: string,
    ): Promise<void> {
      await observationGroupSpeciesRepository.removeRelationship(
        observationGroupId,
        speciesId,
      );
    },
  };
}
