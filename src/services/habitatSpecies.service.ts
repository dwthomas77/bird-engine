import type { Habitat } from "../types.js";
import { ValidationError } from "../errors.js";
import type { HabitatRepository } from "../repositories/habitat.repository.js";
import type { HabitatSpeciesRepository } from "../repositories/habitatSpecies.repository.js";

export interface SpeciesHabitatService {
  synchronizeHabitats(
    speciesId: string,
    habitatIds: string[],
  ): Promise<void>;

  getHabitatsForSpecies(
    speciesId: string,
  ): Promise<Habitat[]>;
};

export function habitatSpeciesServiceFactory({
  habitatSpeciesRepository,
  habitatRepository,
}: {
  habitatSpeciesRepository: HabitatSpeciesRepository;
  habitatRepository: HabitatRepository;
}): SpeciesHabitatService {
  return {
    async synchronizeHabitats(
      speciesId: string,
      habitatIds: string[],
    ): Promise<void> {
      const allHabitats: Habitat[] = await habitatRepository.getHabitats();
      const foundHabitats = allHabitats.filter((habitat) =>
        habitatIds.includes(habitat.habitatId),
      );
      if (foundHabitats.length !== habitatIds.length) {
        const notFoundIds = habitatIds.filter(
          (id) => !foundHabitats.some((habitat) => habitat.habitatId === id),
        );
        throw new ValidationError(
          `Habitats not found for IDs: ${notFoundIds.join(", ")}`,
          {
            habitatIds: `Habitats not found for IDs: ${notFoundIds.join(", ")}`,
          },
        );
      }
      await habitatSpeciesRepository.synchronizeHabitats(speciesId, habitatIds);
    },
    async getHabitatsForSpecies(
      speciesId: string,
    ): Promise<Habitat[]> {
      const allHabitats: Habitat[] = await habitatRepository.getHabitats();
      const relationships = await habitatSpeciesRepository.getRelationships();
      const habitatIds = relationships
        .filter((relationship) => relationship.speciesId === speciesId)
        .map((relationship) => relationship.habitatId);
      return allHabitats.filter((habitat) => habitatIds.includes(habitat.habitatId));
    },
  };
}
