import {
  getHabitats,
  addHabitatToRepository,
  deleteHabitatFromRepository,
  gethHabitatById,
  updateHabitatInRepository,
} from "./habitat.repository.js";
import type { Habitat } from "../../types.js";
import { ConflictError, ValidationError } from "../../errors.js";

// services/user.service.js

export async function getHabitatsService() {
  const habitatsFromRepo = await getHabitats();
  return habitatsFromRepo || [];
}

export async function addHabitatService(newHabitat: Habitat) {
  const allHabitats = await getHabitats();
  const uidAleadyExists = !!allHabitats.some(
    (habitat) => habitat.habitatId === newHabitat.habitatId,
  );
  if (uidAleadyExists) {
    throw new ConflictError("Conflict - habitatId already exists.", {
      habitatId: "Habitat ID already exists",
    });
  } else {
    return await addHabitatToRepository(newHabitat);
  }
}

export async function updateHabitatService(updatedHabitat: Habitat) {
  const allHabitats = await getHabitats();
  const uidExists = !!allHabitats.some(
    (habitat) => habitat.habitatId === updatedHabitat.habitatId,
  );
  if (!uidExists) {
    throw new ConflictError("Conflict - habitatId does not exist.", {
      habitatId: "Habitat ID does not exist",
    });
  } else {
    return await updateHabitatInRepository(updatedHabitat);
  }
}

export async function removeHabitatService(habitatId: string) {
  const allHabitats = await getHabitats();
  const uidExists = !!allHabitats.find(
    (habitat) => habitat.habitatId === habitatId,
  );
  if (!uidExists) {
    throw new ValidationError("Conflict - habitatId does not exist.", {
      habitatId: "Habitat ID does not exist",
    });
  } else {
    return await deleteHabitatFromRepository(habitatId);
  }
}

export async function getHabitatByIdService(habitatId: string) {
  const habitat = await gethHabitatById(habitatId);
  if (!habitat) {
    throw new ValidationError("Habitat not found", {
      habitatId: "Habitat ID does not exist",
    });
  }
  return habitat;
}

export async function getHabitatsByIdsService(habitatIds: string[]) {
  const habitats = await getHabitats();
  const foundHabitats = habitats.filter((habitat) =>
    habitatIds.includes(habitat.habitatId)
  );
  if (foundHabitats.length !== habitatIds.length) {
    const notFoundIds = habitatIds.filter(
      (id) => !foundHabitats.some((habitat) => habitat.habitatId === id)
    );
    throw new ValidationError(
      `Habitats not found for IDs: ${notFoundIds.join(", ")}`,
      {
        habitatIds: `Habitats not found for IDs: ${notFoundIds.join(", ")}`,
      }
    );
  }
  return foundHabitats;
}
