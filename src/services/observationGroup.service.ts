import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { ObservationGroupRepository } from "../repositories/observationGroup.repository.js";
import type { ObservationGroup, ObservationGroupRequest } from "../types.js";

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
}

export function observationGroupServiceFactory({
  observationGroupRepository,
}: {
  observationGroupRepository: ObservationGroupRepository;
}): ObservationGroupService {
  async function getObservationGroupsService() {
    return observationGroupRepository.getObservationGroups();
  }

  async function addObservationGroupService(
    newGroup: ObservationGroupRequest,
  ) {
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

  return {
    getObservationGroupsService,
    addObservationGroupService,
    getObservationGroupByIdService,
    updateObservationGroupService,
    removeObservationGroupService,
  };
}
