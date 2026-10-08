import type { Habitat } from "../types.js";
import { NotFoundError, ValidationError } from "../errors.js";
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

  getSpeciesIdsForHabitat(habitatId: string): Promise<string[]>;
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
    async getSpeciesIdsForHabitat(habitatId: string): Promise<string[]> {
      const habitat = await habitatRepository.getHabitatById(habitatId);
      if (!habitat) {
        throw new NotFoundError(`Habitat not found for ID: ${habitatId}`, {
          habitatId: `Habitat not found for ID: ${habitatId}`,
        });
      }
      const relationships = await habitatSpeciesRepository.getRelationships();
      return relationships
        .filter((relationship) => relationship.habitatId === habitatId)
        .map((relationship) => relationship.speciesId);
    },
  };
}
