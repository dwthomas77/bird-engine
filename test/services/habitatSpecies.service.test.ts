import { expect, it, vi } from "vitest";
import { ValidationError } from "../../src/errors.js";
import { habitatSpeciesServiceFactory } from "../../src/services/habitatSpecies.service.js";
import type { HabitatRepository } from "../../src/repositories/habitat.repository.js";
import type { HabitatSpeciesRepository } from "../../src/repositories/habitatSpecies.repository.js";
import type { Habitat, HabitatSpeciesRelationship } from "../../src/types.js";
import {
	testHabitat,
	testHabitat2,
} from "../repositories/habitat.repository.test.js";

function createMockHabitatRepository(): HabitatRepository {
	return {
		getHabitats: vi.fn(),
		addHabitatToRepository: vi.fn(),
		getHabitatById: vi.fn(),
		deleteHabitatFromRepository: vi.fn(),
		updateHabitatInRepository: vi.fn(),
	};
}

function createMockHabitatSpeciesRepository(): HabitatSpeciesRepository {
	return {
		getRelationships: vi.fn(),
		addRelationship: vi.fn(),
		removeRelationship: vi.fn(),
		synchronizeHabitats: vi.fn(),
	};
}

it("synchronizes habitats after validating that they exist", async () => {
	const habitatRepository = createMockHabitatRepository();
	const habitatSpeciesRepository = createMockHabitatSpeciesRepository();
	const service = habitatSpeciesServiceFactory({
		habitatRepository,
		habitatSpeciesRepository,
	});
	const habitatIds = [testHabitat.habitatId, testHabitat2.habitatId];

	vi.mocked(habitatRepository.getHabitats).mockResolvedValue([
		testHabitat,
		testHabitat2,
	]);

	await service.synchronizeHabitats("species-1", habitatIds);

	expect(habitatSpeciesRepository.synchronizeHabitats).toHaveBeenCalledWith(
		"species-1",
		habitatIds,
	);
});

it("throws ValidationError when synchronizing an unknown habitat", async () => {
	const habitatRepository = createMockHabitatRepository();
	const habitatSpeciesRepository = createMockHabitatSpeciesRepository();
	const service = habitatSpeciesServiceFactory({
		habitatRepository,
		habitatSpeciesRepository,
	});

	vi.mocked(habitatRepository.getHabitats).mockResolvedValue([testHabitat]);

	await expect(
		service.synchronizeHabitats("species-1", ["missing-habitat"]),
	).rejects.toThrow(ValidationError);
	expect(habitatSpeciesRepository.synchronizeHabitats).not.toHaveBeenCalled();
});

it("returns habitats related to the requested species", async () => {
	const habitatRepository = createMockHabitatRepository();
	const habitatSpeciesRepository = createMockHabitatSpeciesRepository();
	const service = habitatSpeciesServiceFactory({
		habitatRepository,
		habitatSpeciesRepository,
	});
	const relationships: HabitatSpeciesRelationship[] = [
		{ habitatId: testHabitat.habitatId, speciesId: "species-1" },
		{ habitatId: testHabitat2.habitatId, speciesId: "species-2" },
	];

	vi.mocked(habitatRepository.getHabitats).mockResolvedValue([
		testHabitat,
		testHabitat2,
	]);
	vi.mocked(habitatSpeciesRepository.getRelationships).mockResolvedValue(
		relationships,
	);

	const habitats: Habitat[] = await service.getHabitatsForSpecies("species-1");

	expect(habitats).toEqual([testHabitat]);
});
