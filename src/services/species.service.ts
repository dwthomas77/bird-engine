import type {
  SpeciesRead,
  Species,
  SpeciesRequest,
} from "../types.js";
import type { SpeciesRepository } from "../repositories/species.repository.js";
import type { SpeciesHabitatService } from "../services/habitatSpecies.service.js";
import type { TaxonRepository } from "../repositories/taxon.repository.js";
import { NotFoundError, ValidationError } from "../errors.js";

// services/user.service.js
export interface SpeciesService {
  getSpeciesService(): Promise<SpeciesRead[]>;
  addSpeciesService(newSpecies: SpeciesRequest): Promise<SpeciesRead>;
  updateSpeciesService(
    uid: string,
    updatedSpecies: SpeciesRequest,
  ): Promise<SpeciesRead>;
  removeSpeciesService(speciesId: string): Promise<void>;
  getSpeciesByIdService(speciesId: string): Promise<SpeciesRead>;
}

export function speciesServiceFactory({
  speciesRepository,
  speciesHabitatService,
  taxonRepository,
}: {
  speciesRepository: SpeciesRepository;
  speciesHabitatService: SpeciesHabitatService;
  taxonRepository: TaxonRepository;
}): SpeciesService {

  async function validateTaxonomy(
    species: Pick<SpeciesRequest, "taxonId" | "genusId" | "familyId">,
  ): Promise<void> {
    const errors: Record<string, string> = {};
    const taxon = await taxonRepository.getSpeciesById(species.taxonId);
    if (!taxon) {
      errors.taxonId = "Taxon species ID does not exist";
    } else {
      if (!(await taxonRepository.getGenusById(species.genusId))) {
        errors.genusId = "Genus ID does not exist";
      } else if (species.genusId !== taxon.genusId) {
        errors.genusId = "Genus ID does not match the taxon species";
      }
      if (!(await taxonRepository.getFamilyById(species.familyId))) {
        errors.familyId = "Family ID does not exist";
      } else if (species.familyId !== taxon.familyId) {
        errors.familyId = "Family ID does not match the taxon species";
      }
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Invalid taxonomy", errors);
    }
  }

  async function enrichSpeciesWithHabitats(
    species: Species,
    habitats: Awaited<ReturnType<SpeciesHabitatService["getHabitatsForSpecies"]>>,
  ): Promise<SpeciesRead> {
    return {
      ...species,
      habitats,
    };
  }

  async function addSpeciesHabitatRelationships(
    speciesId: string,
    habitatIds: string[],
  ): Promise<void> {
    await speciesHabitatService.synchronizeHabitats(speciesId, habitatIds);
  }

  async function getSpeciesService(): Promise<SpeciesRead[]> {
    const species = await speciesRepository.getSpecies();
    const speciesWithHabitats = await Promise.all(
      species.map(async (s) =>
        enrichSpeciesWithHabitats(
          s,
          await speciesHabitatService.getHabitatsForSpecies(s.speciesId),
        ),
      ),
    );
    return speciesWithHabitats;
  }

  async function addSpeciesService(
    newSpecies: SpeciesRequest,
  ): Promise<SpeciesRead> {
    await validateTaxonomy(newSpecies);
    const newSpeciesWithId: Species = {
      ...newSpecies,
      speciesId: crypto.randomUUID(),
    };

    const createdSpecies: Species =
      await speciesRepository.addSpeciesToRepository(newSpeciesWithId);
    await addSpeciesHabitatRelationships(
      createdSpecies.speciesId,
      newSpecies.habitats,
    );
    return enrichSpeciesWithHabitats(
      createdSpecies,
      await speciesHabitatService.getHabitatsForSpecies(createdSpecies.speciesId),
    );
  }

  async function updateSpeciesService(
    uid: string,
    updatedSpecies: SpeciesRequest,
  ): Promise<SpeciesRead> {
    const existingSpecies: Species | undefined =
      await speciesRepository.getSpeciesById(uid);
    if (!existingSpecies) {
      throw new NotFoundError("Species not found", {
        speciesId: "Species ID does not exist",
      });
    }

    await validateTaxonomy(updatedSpecies);

    const updatedSpeciesWithId: Species = {
      ...updatedSpecies,
      speciesId: uid,
    };

    const updatedSpeciesInRepo: Species =
      await speciesRepository.updateSpeciesInRepository(updatedSpeciesWithId);
    await addSpeciesHabitatRelationships(
      updatedSpeciesInRepo.speciesId,
      updatedSpecies.habitats,
    );
    return enrichSpeciesWithHabitats(
      updatedSpeciesInRepo,
      await speciesHabitatService.getHabitatsForSpecies(updatedSpeciesInRepo.speciesId),
    );
  }

  async function removeSpeciesService(
    speciesId: string,
  ): Promise<void> {
    const existingSpecies: Species | undefined =
      await speciesRepository.getSpeciesById(speciesId);
    if (!existingSpecies) {
      throw new NotFoundError("Species not found", {
        speciesId: "Species ID does not exist",
      });
    }
    await speciesRepository.deleteSpeciesFromRepository(speciesId);
  }

  async function getSpeciesByIdService(
    speciesId: string,
  ): Promise<SpeciesRead> {
    const existingSpecies: Species | undefined =
      await speciesRepository.getSpeciesById(speciesId);
    if (!existingSpecies) {
      throw new NotFoundError("Species not found", {
        speciesId: "Species ID does not exist",
      });
    }
    return enrichSpeciesWithHabitats(
      existingSpecies,
      await speciesHabitatService.getHabitatsForSpecies(existingSpecies.speciesId),
    );
  }

  return {
    getSpeciesService,
    addSpeciesService,
    updateSpeciesService,
    removeSpeciesService,
    getSpeciesByIdService,
  };
}
