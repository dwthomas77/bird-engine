import type { SpeciesRepository } from "../repositories/species.repository.js";
import { NotFoundError } from "../errors.js";
import type { Bird } from "../types.js";

export interface BirdService {
  getBird(): Promise<Bird>;
}

export function birdServiceFactory({
  speciesRepository,
}: {
  speciesRepository: SpeciesRepository;
}): BirdService {
  async function getBird(): Promise<Bird> {
    const species = await speciesRepository.getSpecies();
    if (species.length === 0) {
      throw new NotFoundError("No species available to create a bird", {
        species: "At least one species is required",
      });
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