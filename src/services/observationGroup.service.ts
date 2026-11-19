import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type {
  ObservationGroup,
  ObservationGroupRequest,
  ObservationGroupSummary,
  ObservationGroupFamily,
  ObservationGroupGenus,
  ObservationGroupSpecies,
} from "../types.js";
import type { ObservationGroupFamilyRepository } from "../repositories/observationGroupFamily.repository.js";
import type { ObservationGroupGenusRepository } from "../repositories/observationGroupGenus.repository.js";
import type { ObservationGroupSpeciesRepository } from "../repositories/observationGroupSpecies.repository.js";

export interface ObservationGroupService {
  getObservationGroupsService(): Promise<ObservationGroup[]>;
  addObservationGroupService(
    newGroup: ObservationGroupRequest,
  ): Promise<ObservationGroup>;
  getObservationGroupByIdService(
    observationGroupId: string,
  ): Promise<ObservationGroup>;
  updateObservationGroupService(
    observationGroupId: string,
    updatedGroup: ObservationGroupRequest,
  ): Promise<ObservationGroup>;
  removeObservationGroupService(observationGroupId: string): Promise<void>;
  getObservationGroupSummaryByIdService(
    observationGroupId: string,
  ): Promise<ObservationGroupSummary>;
  getAllObservationGroupSummariesService(): Promise<ObservationGroupSummary[]>;
}

export function observationGroupServiceFactory({
  observationGroupRepository,
  observationGroupFamilyRepository,
  observationGroupGenusRepository,
  observationGroupSpeciesRepository,
}: {
  observationGroupRepository: ObservationGroupRepository;
  observationGroupFamilyRepository: ObservationGroupFamilyRepository;
  observationGroupGenusRepository: ObservationGroupGenusRepository;
  observationGroupSpeciesRepository: ObservationGroupSpeciesRepository;
}): ObservationGroupService {
  async function getObservationGroupsService() {
    return observationGroupRepository.getObservationGroups();
  }

  async function addObservationGroupService(newGroup: ObservationGroupRequest) {
    return observationGroupRepository.addObservationGroupToRepository({
      ...newGroup,
      observationGroupId: randomUUID(),
    });
  }

  async function getObservationGroupByIdService(observationGroupId: string) {
    const group =
      await observationGroupRepository.getObservationGroupById(
        observationGroupId,
      );
    if (!group) {
      throw new NotFoundError("Observation group not found", {
        observationGroupId: "Observation group ID does not exist",
      });
    }
    return group;
  }

  async function updateObservationGroupService(
    observationGroupId: string,
    updatedGroup: ObservationGroupRequest,
  ) {
    await getObservationGroupByIdService(observationGroupId);
    return observationGroupRepository.updateObservationGroupInRepository({
      ...updatedGroup,
      observationGroupId,
    });
  }

  async function removeObservationGroupService(observationGroupId: string) {
    await getObservationGroupByIdService(observationGroupId);
    await observationGroupRepository.deleteObservationGroupFromRepository(
      observationGroupId,
    );
  }

  async function enrichObservationGroupWithSummary(
    group: ObservationGroup,
    families: ObservationGroupFamily[],
    genera: ObservationGroupGenus[],
    species: ObservationGroupSpecies[],
  ): Promise<ObservationGroupSummary> {
    const filteredFamilies = families.filter(
      (rel) => rel.observationGroupId === group.observationGroupId,
    );
    const filteredGenera = genera.filter(
      (rel) => rel.observationGroupId === group.observationGroupId,
    );
    const filteredSpecies = species.filter(
      (rel) => rel.observationGroupId === group.observationGroupId,
    );

    return {
      ...group,
      families: filteredFamilies,
      genera: filteredGenera,
      species: filteredSpecies,
    };
  }

  async function getObservationGroupSummaryByIdService(
    observationGroupId: string,
  ): Promise<ObservationGroupSummary> {
    const group: ObservationGroup =
      await getObservationGroupByIdService(observationGroupId);
    const [families, genera, species] = await Promise.all([
      observationGroupFamilyRepository.getRelationships(),
      observationGroupGenusRepository.getRelationships(),
      observationGroupSpeciesRepository.getRelationships(),
    ]);
    const groupWithSummary = await enrichObservationGroupWithSummary(
      group,
      families,
      genera,
      species,
    );
    return groupWithSummary;
  }

  async function getAllObservationGroupSummariesService() {
    const groups = await getObservationGroupsService();
    const groupsWithSummaries = await Promise.all(
      groups.map(async (group) =>
        enrichObservationGroupWithSummary(
          group,
          await observationGroupFamilyRepository.getRelationships(),
          await observationGroupGenusRepository.getRelationships(),
          await observationGroupSpeciesRepository.getRelationships(),
        ),
      ),
    );
    return groupsWithSummaries;
  }

  return {
    getObservationGroupsService,
    addObservationGroupService,
    getObservationGroupByIdService,
    updateObservationGroupService,
    removeObservationGroupService,
    getObservationGroupSummaryByIdService,
    getAllObservationGroupSummariesService,
  };
}
