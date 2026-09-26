import type { Habitat, HabitatRequest } from "../types.js";
import { ValidationError, NotFoundError } from "../errors.js";
import type { HabitatRepository } from "../repositories/habitat.repository.js";

export interface HabitatService {
  getHabitatsService(): Promise<Habitat[]>;
  addHabitatService(newHabitat: HabitatRequest): Promise<Habitat>;
  updateHabitatService(uid: string, updatedHabitat: HabitatRequest): Promise<Habitat>;
  removeHabitatService(habitatId: string): Promise<void>;
  getHabitatByIdService(habitatId: string): Promise<Habitat>;
  getHabitatsByIdsService(habitatIds: string[]): Promise<Habitat[]>;
}

async function getHabitatsService(repository: HabitatRepository) {
  const habitatsFromRepo = await repository.getHabitats();
  return habitatsFromRepo || [];
}

async function addHabitatService(
  newHabitat: HabitatRequest,
  repository: HabitatRepository,
) {
  const newHabitatWithId: Habitat = {
    habitatId: crypto.randomUUID(),
    habitatName: newHabitat.habitatName,
    habitatDescription: newHabitat.habitatDescription,
  };
  return await repository.addHabitatToRepository(newHabitatWithId);
}

async function updateHabitatService(
  uid: string,
  updatedHabitat: HabitatRequest,
  repository: HabitatRepository,
) {
  const allHabitats: Habitat[] = await repository.getHabitats();
  const uidExists = !!allHabitats.some(
    (habitat) => habitat.habitatId === uid,
  );
  if (!uidExists) {
    throw new NotFoundError("Habitat not found", {
      habitatId: "Habitat ID does not exist",
    });
  } else {
    const response = await repository.updateHabitatInRepository({...updatedHabitat, habitatId: uid});
    return response;
  }
}

async function removeHabitatService(
  habitatId: string,
  repository: HabitatRepository,
) {
  const allHabitats: Habitat[] = await repository.getHabitats();
  const uidExists = !!allHabitats.find(
    (habitat) => habitat.habitatId === habitatId,
  );
  if (!uidExists) {
    throw new NotFoundError("Habitat not found", {
      habitatId: "Habitat ID does not exist",
    });
  } else {
    return await repository.deleteHabitatFromRepository(habitatId);
  }
}

async function getHabitatByIdService(
  habitatId: string,
  repository: HabitatRepository,
) {
  const habitat: Habitat | null | undefined =
    await repository.getHabitatById(habitatId);
  if (!habitat) {
    throw new ValidationError("Habitat not found", {
      habitatId: "Habitat ID does not exist",
    });
  }
  return habitat;
}

async function getHabitatsByIdsService(
  habitatIds: string[],
  repository: HabitatRepository,
) {
  const habitats: Habitat[] = await repository.getHabitats();
  const foundHabitats = habitats.filter((habitat) =>
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
  return foundHabitats;
}

export function habitatServiceFactory({
  repository,
}: {
  repository: HabitatRepository;
}): HabitatService {
  return {
    async getHabitatsService(): Promise<Habitat[]> {
      return await getHabitatsService(repository);
    },
    async addHabitatService(newHabitat: HabitatRequest): Promise<Habitat> {
      return await addHabitatService(newHabitat, repository);
    },
    async updateHabitatService(
      uid: string,
      updatedHabitat: HabitatRequest,
    ): Promise<Habitat> {
      return await updateHabitatService(uid, updatedHabitat, repository);
    },
    async removeHabitatService(habitatId: string): Promise<void> {
      return await removeHabitatService(habitatId, repository);
    },
    async getHabitatByIdService(habitatId: string): Promise<Habitat> {
      return await getHabitatByIdService(habitatId, repository);
    },
    async getHabitatsByIdsService(habitatIds: string[]): Promise<Habitat[]> {
      return await getHabitatsByIdsService(habitatIds, repository);
    },
  };
}
