import { it, expect, vi } from "vitest";
import { HabitatRepository } from "../../src/repositories/habitat.repository.js";
import type { HabitatRequest } from "../../src/types.js";
import {
  testHabitat,
  testHabitat2,
} from "../repositories/habitat.repository.test.js";
import { habitatServiceFactory } from "../../src/services/habitat.service.js";
import { NotFoundError } from "../../src/errors.js";

function createMockHabitatRepository(): HabitatRepository {
  return {
    getHabitats: vi.fn(),
    addHabitatToRepository: vi.fn(),
    getHabitatById: vi.fn(),
    deleteHabitatFromRepository: vi.fn(),
    updateHabitatInRepository: vi.fn(),
  };
}

it("throws NotFoundError when updating a habitat that does not exist", async () => {
  const repository = createMockHabitatRepository();

  vi.mocked(repository.getHabitats).mockResolvedValue([
    testHabitat,
    testHabitat2,
  ]);

  const updatedHabitat: HabitatRequest = {
    code: "updated",
    name: "Updated Name",
    description: "Updated Description",
  };

  await expect(
    habitatServiceFactory({ repository }).updateHabitatService("non-existent-id", updatedHabitat),
  ).rejects.toThrow(NotFoundError);
  expect(repository.updateHabitatInRepository).not.toHaveBeenCalled();
});

it("throws NotFoundError when removing a habitat that does not exist", async () => {
  const repository = createMockHabitatRepository();

  vi.mocked(repository.getHabitats).mockResolvedValue([
    testHabitat,
    testHabitat2,
  ]);

  const nonExistentHabitatId = "non-existent-id";

  await expect(
    habitatServiceFactory({ repository }).removeHabitatService(nonExistentHabitatId),
  ).rejects.toThrow(NotFoundError);
  expect(repository.deleteHabitatFromRepository).not.toHaveBeenCalled();
});

const parentHabitat = { habitatId: "p", code: "forest", name: "Forest" };
const childHabitat = {
  habitatId: "c",
  code: "pine",
  name: "Pine",
  parentHabitatId: "p",
};

async function filterHabitats(filter: Parameters<ReturnType<typeof habitatServiceFactory>["getHabitatsService"]>[0]) {
  const repository = createMockHabitatRepository();
  vi.mocked(repository.getHabitats).mockResolvedValue([
    parentHabitat,
    childHabitat,
  ]);
  return habitatServiceFactory({ repository }).getHabitatsService(filter);
}

it("returns all habitats without a filter", async () => {
  expect(await filterHabitats(undefined)).toEqual([parentHabitat, childHabitat]);
});

it("filters habitats by code", async () => {
  expect(await filterHabitats({ code: "pine" })).toEqual([childHabitat]);
});

it("filters habitats by parentId", async () => {
  expect(await filterHabitats({ parentId: "p" })).toEqual([childHabitat]);
});

it("returns only parentless habitats when parentId is null", async () => {
  expect(await filterHabitats({ parentId: null })).toEqual([parentHabitat]);
});

it("combines code and parentId filters", async () => {
  expect(await filterHabitats({ code: "forest", parentId: "p" })).toEqual([]);
});
