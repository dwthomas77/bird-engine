import type { SpeciesRepository } from "../repositories/species.repository.js";
import type { SpeciesHabitatService } from "./habitatSpecies.service.js";
import { NotFoundError } from "../errors.js";
import type { Bird } from "../types.js";

export interface BirdService {
  getBird(filter?: { habitatId?: string }): Promise<Bird>;
}

export function birdServiceFactory({
  speciesRepository,
  speciesHabitatService,
}: {
  speciesRepository: SpeciesRepository;
  speciesHabitatService: SpeciesHabitatService;
}): BirdService {
  async function getBird({
    habitatId,
  }: { habitatId?: string } = {}): Promise<Bird> {
    let species = await speciesRepository.getSpecies();
    if (habitatId) {
      const speciesIds = new Set(
        await speciesHabitatService.getSpeciesIdsForHabitat(habitatId),
      );
      species = species.filter((s) => speciesIds.has(s.speciesId));
    }
    if (species.length === 0) {
      throw new NotFoundError(
        habitatId
          ? "No species available in the habitat to create a bird"
          : "No species available to create a bird",
        { species: "At least one species is required" },
      );
    }

    const selectedSpecies = species[Math.floor(Math.random() * species.length)];

    return {
      birdId: crypto.randomUUID(),
      speciesId: selectedSpecies.speciesId,
      speciesName: selectedSpecies.speciesName,
      localeName: selectedSpecies.localeName,
      genus: selectedSpecies.genus,
      family: selectedSpecies.family,
      sex: Math.random() < 0.5 ? "male" : "female",
      length:
        selectedSpecies.lengthMin +
        Math.random() * (selectedSpecies.lengthMax - selectedSpecies.lengthMin),
      wingspan:
        selectedSpecies.wingspanMin +
        Math.random() *
          (selectedSpecies.wingspanMax - selectedSpecies.wingspanMin),
      weight:
        selectedSpecies.weightMin +
        Math.random() * (selectedSpecies.weightMax - selectedSpecies.weightMin),
    };
  }

  return { getBird };
}