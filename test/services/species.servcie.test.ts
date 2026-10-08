import { expect, it, vi } from "vitest";
import { NotFoundError } from "../../src/errors.js";
import type { SpeciesRepository } from "../../src/repositories/species.repository.js";
import type { SpeciesHabitatService } from "../../src/services/habitatSpecies.service.js";
import { speciesServiceFactory } from "../../src/services/species.service.js";
import type { Habitat, Species, SpeciesRequest } from "../../src/types.js";
import {
	testHabitat,
	testHabitat2,
} from "../repositories/habitat.repository.test.js";

const testSpecies: Species = {
	speciesId: "species-1",
	speciesName: "Peregrine Falcon",
	family: "Falconidae",
	genus: "Falco",
	localeName: "Peregrine",
	lengthMin: 34,
	lengthMax: 58,
	weightMin: 0.7,
	weightMax: 1.5,
	wingspanMin: 74,
	wingspanMax: 120,
};

const testSpeciesRequest: SpeciesRequest = {
	speciesName: testSpecies.speciesName,
	family: testSpecies.family,
	genus: testSpecies.genus,
	localeName: testSpecies.localeName,
	lengthMin: testSpecies.lengthMin,
	lengthMax: testSpecies.lengthMax,
	weightMin: testSpecies.weightMin,
	weightMax: testSpecies.weightMax,
	wingspanMin: testSpecies.wingspanMin,
	wingspanMax: testSpecies.wingspanMax,
	habitats: [testHabitat.habitatId],
};

function createMockSpeciesRepository(): SpeciesRepository {
	return {
		getSpecies: vi.fn(),
		addSpeciesToRepository: vi.fn(),
		getSpeciesById: vi.fn(),
		deleteSpeciesFromRepository: vi.fn(),
		updateSpeciesInRepository: vi.fn(),
	};
}

function createMockSpeciesHabitatService(): SpeciesHabitatService {
	return {
		synchronizeHabitats: vi.fn(),
		getHabitatsForSpecies: vi.fn(),
		getSpeciesIdsForHabitat: vi.fn(),
	};
}

function createService(
	speciesRepository = createMockSpeciesRepository(),
	speciesHabitatService = createMockSpeciesHabitatService(),
) {
	return {
		service: speciesServiceFactory({
			speciesRepository,
			speciesHabitatService,
		}),
		speciesRepository,
		speciesHabitatService,
	};
}

it("returns all species with their habitats", async () => {
	const { service, speciesRepository, speciesHabitatService } = createService();
	const habitats: Habitat[] = [testHabitat];

	vi.mocked(speciesRepository.getSpecies).mockResolvedValue([testSpecies]);
	vi.mocked(speciesHabitatService.getHabitatsForSpecies).mockResolvedValue(
		habitats,
	);

	await expect(service.getSpeciesService()).resolves.toEqual([
		{ ...testSpecies, habitats },
	]);
	expect(speciesHabitatService.getHabitatsForSpecies).toHaveBeenCalledWith(
		testSpecies.speciesId,
	);
});

it("adds a species and synchronizes its habitats", async () => {
	const { service, speciesRepository, speciesHabitatService } = createService();
	const createdSpecies = { ...testSpecies, speciesId: "species-2" };
	const habitats: Habitat[] = [testHabitat];

	vi.mocked(speciesRepository.addSpeciesToRepository).mockResolvedValue(
		createdSpecies,
	);
	vi.mocked(speciesHabitatService.getHabitatsForSpecies).mockResolvedValue(
		habitats,
	);

	await expect(service.addSpeciesService(testSpeciesRequest)).resolves.toEqual(
		{ ...createdSpecies, habitats },
	);
	expect(speciesRepository.addSpeciesToRepository).toHaveBeenCalledWith(
		expect.objectContaining(testSpeciesRequest),
	);
	expect(speciesHabitatService.synchronizeHabitats).toHaveBeenCalledWith(
		createdSpecies.speciesId,
		testSpeciesRequest.habitats,
	);
});

it("updates an existing species and synchronizes its habitats", async () => {
	const { service, speciesRepository, speciesHabitatService } = createService();
	const habitats: Habitat[] = [testHabitat2];

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(testSpecies);
	vi.mocked(speciesRepository.updateSpeciesInRepository).mockResolvedValue(
		testSpecies,
	);
	vi.mocked(speciesHabitatService.getHabitatsForSpecies).mockResolvedValue(
		habitats,
	);

	await expect(
		service.updateSpeciesService(testSpecies.speciesId, testSpeciesRequest),
	).resolves.toEqual({ ...testSpecies, habitats });
	expect(speciesRepository.updateSpeciesInRepository).toHaveBeenCalledWith({
		...testSpeciesRequest,
		speciesId: testSpecies.speciesId,
	});
	expect(speciesHabitatService.synchronizeHabitats).toHaveBeenCalledWith(
		testSpecies.speciesId,
		testSpeciesRequest.habitats,
	);
});

it("throws NotFoundError when updating a species that does not exist", async () => {
	const { service, speciesRepository } = createService();

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(undefined);

	await expect(
		service.updateSpeciesService("missing-species", testSpeciesRequest),
	).rejects.toThrow(NotFoundError);
	expect(speciesRepository.updateSpeciesInRepository).not.toHaveBeenCalled();
});

it("removes an existing species", async () => {
	const { service, speciesRepository } = createService();

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(testSpecies);

	await service.removeSpeciesService(testSpecies.speciesId);

	expect(speciesRepository.deleteSpeciesFromRepository).toHaveBeenCalledWith(
		testSpecies.speciesId,
	);
});

it("throws NotFoundError when removing a species that does not exist", async () => {
	const { service, speciesRepository } = createService();

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(undefined);

	await expect(
		service.removeSpeciesService("missing-species"),
	).rejects.toThrow(NotFoundError);
	expect(speciesRepository.deleteSpeciesFromRepository).not.toHaveBeenCalled();
});

it("returns a species by ID with its habitats", async () => {
	const { service, speciesRepository, speciesHabitatService } = createService();
	const habitats: Habitat[] = [testHabitat, testHabitat2];

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(testSpecies);
	vi.mocked(speciesHabitatService.getHabitatsForSpecies).mockResolvedValue(
		habitats,
	);

	await expect(
		service.getSpeciesByIdService(testSpecies.speciesId),
	).resolves.toEqual({ ...testSpecies, habitats });
});

it("throws NotFoundError when getting a species that does not exist", async () => {
	const { service, speciesRepository, speciesHabitatService } = createService();

	vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(undefined);

	await expect(
		service.getSpeciesByIdService("missing-species"),
	).rejects.toThrow(NotFoundError);
	expect(speciesHabitatService.getHabitatsForSpecies).not.toHaveBeenCalled();
});
