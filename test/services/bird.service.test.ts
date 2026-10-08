import { afterEach, expect, it, vi } from "vitest";
import type { SpeciesRepository } from "../../src/repositories/species.repository.js";
import { birdServiceFactory } from "../../src/services/bird.service.js";
import { NotFoundError } from "../../src/errors.js";
import type { SpeciesHabitatService } from "../../src/services/habitatSpecies.service.js";
import type { Species } from "../../src/types.js";

const firstSpecies: Species = {
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

const secondSpecies: Species = {
  ...firstSpecies,
  speciesId: "species-2",
  speciesName: "Golden Eagle",
};

afterEach(() => {
  vi.restoreAllMocks();
});

function createHabitatService(speciesIds: string[] = []): SpeciesHabitatService {
  return {
    synchronizeHabitats: vi.fn(),
    getHabitatsForSpecies: vi.fn(),
    getSpeciesIdsForHabitat: vi.fn().mockResolvedValue(speciesIds),
  };
}

function createSpeciesRepository(species: Species[]): SpeciesRepository {
  return {
    getSpecies: vi.fn().mockResolvedValue(species),
    addSpeciesToRepository: vi.fn(),
    getSpeciesById: vi.fn(),
    deleteSpeciesFromRepository: vi.fn(),
    updateSpeciesInRepository: vi.fn(),
  };
}

it("creates a bird from a random species with values within its ranges", async () => {
  const speciesRepository = createSpeciesRepository([
    firstSpecies,
    secondSpecies,
  ]);
  const randomValues = [0.75, 0.25, 0, 0.5, 0.999];
  vi.spyOn(Math, "random").mockImplementation(() => randomValues.shift() ?? 0);

  const bird = await birdServiceFactory({
    speciesRepository,
    speciesHabitatService: createHabitatService(),
  }).getBird();

  expect(bird).toEqual({
    birdId: expect.any(String),
    speciesId: secondSpecies.speciesId,
    speciesName: secondSpecies.speciesName,
    localeName: secondSpecies.localeName,
    genus: secondSpecies.genus,
    family: secondSpecies.family,
    sex: "male",
    length: secondSpecies.lengthMin,
    wingspan: (secondSpecies.wingspanMin + secondSpecies.wingspanMax) / 2,
    weight:
      secondSpecies.weightMin +
      0.999 * (secondSpecies.weightMax - secondSpecies.weightMin),
  });
  expect(speciesRepository.getSpecies).toHaveBeenCalledOnce();
});

it("throws when no species are available", async () => {
  const speciesRepository = createSpeciesRepository([]);

  await expect(
    birdServiceFactory({
    speciesRepository,
    speciesHabitatService: createHabitatService(),
  }).getBird(),
  ).rejects.toThrow(NotFoundError);
});

it("only selects species found in the requested habitat", async () => {
  const speciesRepository = createSpeciesRepository([
    firstSpecies,
    secondSpecies,
  ]);
  const speciesHabitatService = createHabitatService(["species-1"]);

  const bird = await birdServiceFactory({
    speciesRepository,
    speciesHabitatService,
  }).getBird({ habitatId: "habitat-1" });

  expect(bird.speciesId).toBe(firstSpecies.speciesId);
  expect(speciesHabitatService.getSpeciesIdsForHabitat).toHaveBeenCalledWith(
    "habitat-1",
  );
});

it("throws when the habitat has no species", async () => {
  await expect(
    birdServiceFactory({
      speciesRepository: createSpeciesRepository([firstSpecies]),
      speciesHabitatService: createHabitatService([]),
    }).getBird({ habitatId: "habitat-1" }),
  ).rejects.toThrow(NotFoundError);
});
