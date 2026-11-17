import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../src/errors.js";
import { observationGroupGenusServiceFactory } from "../../src/services/observationGroupGenus.service.js";
import type { ObservationGroupRepository } from "../../src/repositories/observationGroup.repository.js";
import type { ObservationGroupGenusRepository } from "../../src/repositories/observationGroupGenus.repository.js";
import type { TaxonRepository } from "../../src/repositories/taxon.repository.js";

function createObservationGroupRepository(): ObservationGroupRepository {
  return {
    getObservationGroups: vi.fn(),
    addObservationGroupToRepository: vi.fn(),
    getObservationGroupById: vi.fn(),
    updateObservationGroupInRepository: vi.fn(),
    deleteObservationGroupFromRepository: vi.fn(),
  };
}

function createObservationGroupGenusRepository(): ObservationGroupGenusRepository {
  return {
    getRelationships: vi.fn(),
    addRelationship: vi.fn(),
    removeRelationship: vi.fn(),
  };
}

function createTaxonRepository(): TaxonRepository {
  return {
    getTaxa: vi.fn(),
    getTaxonById: vi.fn(),
    getFamilies: vi.fn(),
    getFamilyByGenusId: vi.fn(),
    getGenera: vi.fn(),
    getGenusById: vi.fn(),
    getSpecies: vi.fn(),
    getSpeciesById: vi.fn(),
  };
}

describe("ObservationGroupGenusService", () => {
  it("adds a relationship after validating the group and genus", async () => {
    const observationGroupRepository = createObservationGroupRepository();
    const observationGroupGenusRepository =
      createObservationGroupGenusRepository();
    const taxonRepository = createTaxonRepository();
    vi.mocked(observationGroupRepository.getObservationGroupById)
      .mockResolvedValue({
        observationGroupId: "group-1",
        name: "Raptors",
      });
    vi.mocked(taxonRepository.getGenusById).mockResolvedValue({
      taxonId: "genus-1",
      rank: "genus",
      name: "Buteo",
      familyId: "family-1",
    });

    const service = observationGroupGenusServiceFactory({
      observationGroupGenusRepository,
      observationGroupRepository,
      taxonRepository,
    });
    const relationship = {
      observationGroupId: "group-1",
      genusId: "genus-1",
    };

    await expect(service.addRelationshipService(relationship)).resolves.toEqual(
      relationship,
    );
    expect(observationGroupGenusRepository.addRelationship).toHaveBeenCalledWith(
      "group-1",
      "genus-1",
    );
  });

  it("rejects a relationship to an unknown genus", async () => {
    const observationGroupRepository = createObservationGroupRepository();
    const observationGroupGenusRepository =
      createObservationGroupGenusRepository();
    const taxonRepository = createTaxonRepository();
    vi.mocked(observationGroupRepository.getObservationGroupById)
      .mockResolvedValue({
        observationGroupId: "group-1",
        name: "Raptors",
      });
    vi.mocked(taxonRepository.getGenusById).mockResolvedValue(undefined);

    const service = observationGroupGenusServiceFactory({
      observationGroupGenusRepository,
      observationGroupRepository,
      taxonRepository,
    });

    await expect(
      service.addRelationshipService({
        observationGroupId: "group-1",
        genusId: "missing-genus",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(observationGroupGenusRepository.addRelationship).not.toHaveBeenCalled();
  });
});
