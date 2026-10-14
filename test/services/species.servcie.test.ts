import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../src/errors.js";
import type { SpeciesRepository } from "../../src/repositories/species.repository.js";
import type { SpeciesHabitatService } from "../../src/services/habitatSpecies.service.js";
import type { TaxonRepository } from "../../src/repositories/taxon.repository.js";
import { speciesServiceFactory } from "../../src/services/species.service.js";
import type { Habitat, Species, SpeciesRequest } from "../../src/types.js";
import {
	testHabitat,
	testHabitat2,
} from "../repositories/habitat.repository.test.js";

const testSpecies: Species = {
	speciesId: "species-1",
	speciesName: "Peregrine Falcon",
	taxonId: "falco-test",
	genusId: "falco",
	familyId: "falconidae",
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
	taxonId: testSpecies.taxonId,
	genusId: testSpecies.genusId,
	familyId: testSpecies.familyId,
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

function createMockTaxonRepository(): TaxonRepository {
	return {
		getTaxa: vi.fn(),
		getTaxonById: vi.fn(),
		getFamilies: vi.fn(),
		getFamilyById: vi.fn().mockResolvedValue({
			taxonId: testSpecies.familyId,
			rank: "family",
			name: "Falcons",
		}),
		getGenera: vi.fn(),
		getGenusById: vi.fn().mockResolvedValue({
			taxonId: testSpecies.genusId,
			rank: "genus",
			name: "Falco",
			familyId: testSpecies.familyId,
		}),
		getSpecies: vi.fn(),
		getSpeciesById: vi.fn().mockResolvedValue({
			taxonId: testSpecies.taxonId,
			rank: "species",
			name: "Peregrine Falcon",
			scientificName: testSpecies.speciesName,
			genusId: testSpecies.genusId,
			familyId: testSpecies.familyId,
		}),
	};
}

function createService(
	speciesRepository = createMockSpeciesRepository(),
	speciesHabitatService = createMockSpeciesHabitatService(),
	taxonRepository = createMockTaxonRepository(),
) {
	return {
		service: speciesServiceFactory({
			speciesRepository,
			speciesHabitatService,
			taxonRepository,
		}),
		speciesRepository,
		speciesHabitatService,
		taxonRepository,
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

describe("taxonomy validation", () => {
	it("rejects an unknown taxon id on create", async () => {
		const { service, speciesRepository, taxonRepository } = createService();
		vi.mocked(taxonRepository.getSpeciesById).mockResolvedValue(undefined);

		await expect(
			service.addSpeciesService(testSpeciesRequest),
		).rejects.toMatchObject({
			code: "VALIDATION_ERROR",
			errors: { taxonId: expect.any(String) },
		});
		expect(speciesRepository.addSpeciesToRepository).not.toHaveBeenCalled();
	});

	it("rejects genus and family ids that don't exist or don't match the taxon", async () => {
		const { service, taxonRepository } = createService();
		vi.mocked(taxonRepository.getGenusById).mockResolvedValue(undefined);

		await expect(
			service.addSpeciesService({ ...testSpeciesRequest, familyId: "other" }),
		).rejects.toMatchObject({
			code: "VALIDATION_ERROR",
			errors: {
				genusId: "Genus ID does not exist",
				familyId: "Family ID does not match the taxon species",
			},
		});
	});

	it("validates taxonomy on update before changing anything", async () => {
		const { service, speciesRepository, taxonRepository } = createService();
		vi.mocked(speciesRepository.getSpeciesById).mockResolvedValue(testSpecies);
		vi.mocked(taxonRepository.getSpeciesById).mockResolvedValue(undefined);

		await expect(
			service.updateSpeciesService(testSpecies.speciesId, testSpeciesRequest),
		).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
		expect(speciesRepository.updateSpeciesInRepository).not.toHaveBeenCalled();
	});
});
