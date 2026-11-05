import { beforeEach, describe, expect, it } from "vitest";
import { observationGroupServiceFactory } from "../../src/services/observationGroup.service.js";
import type { ObservationGroupRepository } from "../../src/repositories/observationGroup.repository.js";
import type { ObservationGroup } from "../../src/types.js";
import { NotFoundError } from "../../src/errors.js";

function fakeRepository(): ObservationGroupRepository {
  let items: ObservationGroup[] = [];
  return {
    getObservationGroups: async () => items,
    addObservationGroupToRepository: async (g) => {
      items.push(g);
      return g;
    },
    getObservationGroupById: async (id) =>
      items.find((g) => g.observationGroupId === id),
    updateObservationGroupInRepository: async (g) => {
      items = items.map((i) =>
        i.observationGroupId === g.observationGroupId ? g : i,
      );
      return g;
    },
    deleteObservationGroupFromRepository: async (id) => {
      items = items.filter((g) => g.observationGroupId !== id);
    },
  };
}

describe("ObservationGroupService", () => {
  let service: ReturnType<typeof observationGroupServiceFactory>;

  beforeEach(() => {
    service = observationGroupServiceFactory({
      observationGroupRepository: fakeRepository(),
    });
  });

  it("adds a group with a generated id", async () => {
    const group = await service.addObservationGroupService({ name: "Owls" });
    expect(group).toEqual({ name: "Owls", observationGroupId: expect.any(String) });
    expect(await service.getObservationGroupsService()).toEqual([group]);
  });

  it("updates a group keeping its id", async () => {
    const group = await service.addObservationGroupService({ name: "Owls" });
    const updated = await service.updateObservationGroupService(
      group.observationGroupId,
      { name: "Raptors" },
    );
    expect(updated).toEqual({
      name: "Raptors",
      observationGroupId: group.observationGroupId,
    });
  });

  it("removes a group", async () => {
    const group = await service.addObservationGroupService({ name: "Owls" });
    await service.removeObservationGroupService(group.observationGroupId);
    expect(await service.getObservationGroupsService()).toEqual([]);
  });

  it("throws NotFoundError for unknown ids", async () => {
    await expect(service.getObservationGroupByIdService("x")).rejects.toThrow(
      NotFoundError,
    );
    await expect(
      service.updateObservationGroupService("x", { name: "n" }),
    ).rejects.toThrow(NotFoundError);
    await expect(service.removeObservationGroupService("x")).rejects.toThrow(
      NotFoundError,
    );
  });
});
