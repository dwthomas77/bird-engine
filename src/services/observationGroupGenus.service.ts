import { ValidationError } from "../errors.js";
import type { ObservationGroupGenus } from "../types.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type { ObservationGroupGenusRepository } from "../repositories/observationGroupGenus.repository.js";
import type { TaxonRepository } from "../repositories/taxon.repository.js";

export interface ObservationGroupGenusService {
  getRelationshipsService(): Promise<ObservationGroupGenus[]>;
  addRelationshipService(
    relationship: ObservationGroupGenus,
  ): Promise<ObservationGroupGenus>;
  removeRelationshipService(
    observationGroupId: string,
    genusId: string,
  ): Promise<void>;
}

export function observationGroupGenusServiceFactory({
  observationGroupGenusRepository,
  observationGroupRepository,
  taxonRepository,
}: {
  observationGroupGenusRepository: ObservationGroupGenusRepository;
  observationGroupRepository: ObservationGroupRepository;
  taxonRepository: TaxonRepository;
}): ObservationGroupGenusService {
  return {
    async getRelationshipsService(): Promise<ObservationGroupGenus[]> {
      return observationGroupGenusRepository.getRelationships();
    },

    async addRelationshipService(
      relationship: ObservationGroupGenus,
    ): Promise<ObservationGroupGenus> {
      const observationGroup =
        await observationGroupRepository.getObservationGroupById(
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

      const genus = await taxonRepository.getGenusById(relationship.genusId);
      if (!genus) {
        throw new ValidationError(
          `Genus not found for ID: ${relationship.genusId}`,
          {
            genusId: `Genus not found for ID: ${relationship.genusId}`,
          },
        );
      }

      await observationGroupGenusRepository.addRelationship(
        relationship.observationGroupId,
        relationship.genusId,
        relationship.excluded,
      );
      return relationship;
    },

    async removeRelationshipService(
      observationGroupId: string,
      genusId: string,
    ): Promise<void> {
      await observationGroupGenusRepository.removeRelationship(
        observationGroupId,
        genusId,
      );
    },
  };
}
