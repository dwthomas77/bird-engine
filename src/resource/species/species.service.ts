import type { CreateSpecies, Species } from "../../types.js";
import { ConflictError, ValidationError } from "../../errors.js";
import {
  addSpeciesToRepository,
  deleteSpeciesFromRepository,
  getSpecies,
  getSpeciesById,
  updateSpeciesInRepository,
} from "./species.repository.js";

export const getSpeciesService = getSpecies;

export async function addSpeciesService(
  newSpecies: CreateSpecies,
): Promise<Species> {
  const existingSpecies = await getSpecies();

  const conflict = existingSpecies.find(
    (species) =>
      species.speciesId === newSpecies.speciesId ||
      species.speciesName === newSpecies.speciesName ||
      species.localeName === newSpecies.localeName,
  );

  if (conflict) {
    const errors: Record<string, string> = {};

    if (conflict.speciesId === newSpecies.speciesId) {
      errors.speciesId = "Species ID already exists";
    }

    if (conflict.speciesName === newSpecies.speciesName) {
      errors.speciesName = "Species name already exists";
    }

    if (conflict.localeName === newSpecies.localeName) {
      errors.localeName = "Locale name already exists";
    }

    throw new ConflictError("Conflict - species already exists.", errors);
  }

  return addSpeciesToRepository(newSpecies as Species);
}

export async function updateSpeciesService(
  updatedSpecies: Species,
): Promise<Species> {

  const existingSpecies = await getSpecies();
  const updatedSpeciesList = existingSpecies.filter((item) => item.speciesId !== updatedSpecies.speciesId);

  if (
    !existingSpecies.some((species) => species.speciesId === updatedSpecies.speciesId)
  ) {
    throw new ConflictError("Conflict - speciesId does not exist.", {
      speciesId: "Species ID does not exist",
    });
  }

  const conflict = updatedSpeciesList.find(
    (species) =>
      species.speciesId === updatedSpecies.speciesId ||
      species.speciesName === updatedSpecies.speciesName ||
      species.localeName === updatedSpecies.localeName,
  );

  if (conflict) {
    const errors: Record<string, string> = {};

    if (conflict.speciesId === updatedSpecies.speciesId) {
      errors.speciesId = "Species ID already exists";
    }

    if (conflict.speciesName === updatedSpecies.speciesName) {
      errors.speciesName = "Species name already exists";
    }

    if (conflict.localeName === updatedSpecies.localeName) {
      errors.localeName = "Locale name already exists";
    }

    throw new ConflictError("Conflict - species already exists.", errors);
  }

  return updateSpeciesInRepository(updatedSpecies);
}

export async function removeSpeciesService(speciesId: string): Promise<void> {
  if (
    !(await getSpecies()).some((species) => species.speciesId === speciesId)
  ) {
    throw new ValidationError("Species not found", {
      speciesId: "Species ID does not exist",
    });
  }
  return deleteSpeciesFromRepository(speciesId);
}

export async function getSpeciesByIdService(
  speciesId: string,
): Promise<Species | []> {
  const species = await getSpeciesById(speciesId);
  if (!species) return [];
  return species;
}
