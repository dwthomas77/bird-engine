import { ValidationError } from "../errors.js";
import type { ObservationGroupFamily } from "../types.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type { ObservationGroupFamilyRepository } from "../repositories/observationGroupFamily.repository.js";
import type { TaxonRepository } from "../repositories/taxon.repository.js";

export interface ObservationGroupFamilyService {
  getRelationshipsService(): Promise<ObservationGroupFamily[]>;
  addRelationshipService(
    relationship: ObservationGroupFamily,
  ): Promise<ObservationGroupFamily>;
  removeRelationshipService(
    observationGroupId: string,
    familyId: string,
  ): Promise<void>;
}

export function observationGroupFamilyServiceFactory({
  observationGroupFamilyRepository,
  observationGroupRepository,
  taxonRepository,
}: {
  observationGroupFamilyRepository: ObservationGroupFamilyRepository;
  observationGroupRepository: ObservationGroupRepository;
  taxonRepository: TaxonRepository;
}): ObservationGroupFamilyService {
  return {
    async getRelationshipsService(): Promise<ObservationGroupFamily[]> {
      return observationGroupFamilyRepository.getRelationships();
    },

    async addRelationshipService(
      relationship: ObservationGroupFamily,
    ): Promise<ObservationGroupFamily> {
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

      const families = await taxonRepository.getFamilies();
      if (!families.some((family) => family.taxonId === relationship.familyId)) {
        throw new ValidationError(
          `Family not found for ID: ${relationship.familyId}`,
          {
            familyId: `Family not found for ID: ${relationship.familyId}`,
          },
        );
      }

      await observationGroupFamilyRepository.addRelationship(
        relationship.observationGroupId,
        relationship.familyId,
        relationship.excluded,
      );
      return relationship;
    },

    async removeRelationshipService(
      observationGroupId: string,
      familyId: string,
    ): Promise<void> {
      await observationGroupFamilyRepository.removeRelationship(
        observationGroupId,
        familyId,
      );
    },
  };
}
