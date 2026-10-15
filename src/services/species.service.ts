import type {
  SpeciesRead,
  Species,
  SpeciesRequest,
  SpeciesSummary,
} from "../types.js";
import type { SpeciesRepository } from "../repositories/species.repository.js";
import type { SpeciesHabitatService } from "../services/habitatSpecies.service.js";
import type { TaxonRepository } from "../repositories/taxon.repository.js";
import { NotFoundError, ValidationError } from "../errors.js";

// services/user.service.js
export interface SpeciesService {
  getSpeciesService(): Promise<SpeciesSummary[]>;
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
    species: Pick<SpeciesRequest, "genusId">,
  ): Promise<void> {
    if (!(await taxonRepository.getGenusById(species.genusId))) {
      throw new ValidationError("Invalid taxonomy", {
        genusId: "Genus ID does not exist",
      });
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

  async function enrichSpeciesWithSummary(
    species: Species,
    habitats: Awaited<ReturnType<SpeciesHabitatService["getHabitatsForSpecies"]>>,
    genusTaxon: Awaited<ReturnType<TaxonRepository["getGenusById"]>>,
    familyTaxon: Awaited<ReturnType<TaxonRepository["getFamilyByGenusId"]>>,
  ): Promise<SpeciesSummary> {
    const genus = {
      genusId: species.genusId,
      name: genusTaxon?.name ?? "",
    };
    const family = {
      familyId: familyTaxon?.taxonId ?? "",
      name: familyTaxon?.name ?? "",
    };
    return {
      ...species,
      habitats,
      genus,
      family,
    };
  }

  async function addSpeciesHabitatRelationships(
    speciesId: string,
    habitatIds: string[],
  ): Promise<void> {
    await speciesHabitatService.synchronizeHabitats(speciesId, habitatIds);
  }

  async function getSpeciesService(): Promise<SpeciesSummary[]> {
    const species = await speciesRepository.getSpecies();
    const speciesWithSummaries = await Promise.all(
      species.map(async (s) =>
        enrichSpeciesWithSummary(
          s,
          await speciesHabitatService.getHabitatsForSpecies(s.speciesId),
          await taxonRepository.getGenusById(s.genusId),
          await taxonRepository.getFamilyByGenusId(s.genusId),
        ),
      ),
    );
    return speciesWithSummaries;
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
    return enrichSpeciesWithSummary(
      existingSpecies,
      await speciesHabitatService.getHabitatsForSpecies(existingSpecies.speciesId),
      await taxonRepository.getGenusById(existingSpecies.genusId),
      await taxonRepository.getFamilyByGenusId(existingSpecies.genusId),
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
