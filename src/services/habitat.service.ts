import type { Habitat, HabitatRequest } from "../types.js";
import { ValidationError, NotFoundError } from "../errors.js";
import type { HabitatRepository } from "../repositories/habitat.repository.js";

export interface HabitatFilter {
  code?: string;
  // null means only habitats with no parent
  parentId?: string | null;
  // level of the habitat in the hierarchy
  level?: number;
}

export interface HabitatService {
  getHabitatsService(filter?: HabitatFilter): Promise<Habitat[]>;
  addHabitatService(newHabitat: HabitatRequest): Promise<Habitat>;
  updateHabitatService(uid: string, updatedHabitat: HabitatRequest): Promise<Habitat>;
  removeHabitatService(habitatId: string): Promise<void>;
  getHabitatByIdService(habitatId: string): Promise<Habitat>;
  getHabitatsByIdsService(habitatIds: string[]): Promise<Habitat[]>;
}

// Code format XX.XX.XX: level = number of "." separators + 1
function getHabitatLevel(code: string): number {
  return code.split(".").length;
}

async function getHabitatsService(
  repository: HabitatRepository,
  filter: HabitatFilter = {},
) {
  const habitatsFromRepo = (await repository.getHabitats()) || [];
  return habitatsFromRepo.filter((habitat) => {
    if (filter.code !== undefined && habitat.code !== filter.code) return false;
    if (filter.parentId === null && habitat.parentHabitatId) return false;
    if (
      filter.parentId !== undefined &&
      filter.parentId !== null &&
      habitat.parentHabitatId !== filter.parentId
    ) {
      return false;
    }
    if (
      filter.level !== undefined &&
      getHabitatLevel(habitat.code) !== filter.level
    ) {
      return false;
    }
    return true;
  });
}

async function addHabitatService(
  newHabitat: HabitatRequest,
  repository: HabitatRepository,
) {
  const newHabitatWithId: Habitat = {
    habitatId: crypto.randomUUID(),
    ...newHabitat,
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
    async getHabitatsService(filter?: HabitatFilter): Promise<Habitat[]> {
      return await getHabitatsService(repository, filter);
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
