import { NotFoundError } from "../errors.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type { ObservationGroupFamilyRepository } from "../repositories/observationGroupFamily.repository.js";
import type { ObservationGroupGenusRepository } from "../repositories/observationGroupGenus.repository.js";
import type { ObservationGroupSpeciesRepository } from "../repositories/observationGroupSpecies.repository.js";
import type { SpeciesRepository } from "../repositories/species.repository.js";
import type { TaxonRepository } from "../repositories/taxon.repository.js";
import type { Species } from "../types.js";

export interface ObservationGroupMembershipService {
  getSpeciesForGroup(observationGroupId: string): Promise<Species[]>;
}

export function observationGroupMembershipServiceFactory({
  observationGroupRepository,
  observationGroupFamilyRepository,
  observationGroupGenusRepository,
  observationGroupSpeciesRepository,
  speciesRepository,
  taxonRepository,
}: {
  observationGroupRepository: ObservationGroupRepository;
  observationGroupFamilyRepository: ObservationGroupFamilyRepository;
  observationGroupGenusRepository: ObservationGroupGenusRepository;
  observationGroupSpeciesRepository: ObservationGroupSpeciesRepository;
  speciesRepository: SpeciesRepository;
  taxonRepository: TaxonRepository;
}): ObservationGroupMembershipService {
  return {
    async getSpeciesForGroup(observationGroupId: string): Promise<Species[]> {
      const group = await observationGroupRepository.getObservationGroupById(
        observationGroupId,
      );
      if (!group) {
        throw new NotFoundError("Observation group not found", {
          observationGroupId: "Observation group ID does not exist",
        });
      }

      const [species, genera, speciesRules, genusRules, familyRules] =
        await Promise.all([
          speciesRepository.getSpecies(),
          taxonRepository.getGenera(),
          observationGroupSpeciesRepository.getRelationships(),
          observationGroupGenusRepository.getRelationships(),
          observationGroupFamilyRepository.getRelationships(),
        ]);
      const familyByGenus = new Map(
        genera.map((genus) => [genus.taxonId, genus.familyId]),
      );
      const speciesById = new Map(
        speciesRules
          .filter((rule) => rule.observationGroupId === observationGroupId)
          .map((rule) => [rule.speciesId, !rule.excluded]),
      );
      const genusById = new Map(
        genusRules
          .filter((rule) => rule.observationGroupId === observationGroupId)
          .map((rule) => [rule.genusId, !rule.excluded]),
      );
      const familyById = new Map(
        familyRules
          .filter((rule) => rule.observationGroupId === observationGroupId)
          .map((rule) => [rule.familyId, !rule.excluded]),
      );

      return species.filter((item) => {
        const familyId = familyByGenus.get(item.genusId);
        return (
          speciesById.get(item.speciesId) ??
          genusById.get(item.genusId) ??
          (familyId === undefined ? undefined : familyById.get(familyId)) ??
          false
        );
      });
    },
  };
}
