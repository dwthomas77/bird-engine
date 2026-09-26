import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	SpeciesRepository,
	speciesRepositoryFactory,
} from "../../src/repositories/species.repository.js";
import type { Species } from "../../src/types.js";

let tempDir: string;
let dataFile: string;

export const testSpecies: Species = {
	speciesId: "1",
	speciesName: "Great Blue Heron",
	family: "Ardeidae",
	genus: "Ardea",
	localeName: "Great Blue Heron",
	lengthMin: 91,
	lengthMax: 137,
	weightMin: 2.1,
	weightMax: 2.5,
	wingspanMin: 167,
	wingspanMax: 201,
};

export const testSpecies2: Species = {
	speciesId: "2",
	speciesName: "Bald Eagle",
	family: "Accipitridae",
	genus: "Haliaeetus",
	localeName: "Bald Eagle",
	lengthMin: 71,
	lengthMax: 96,
	weightMin: 3,
	weightMax: 6.3,
	wingspanMin: 168,
	wingspanMax: 244,
};

describe("SpeciesRepository", () => {
	let repository: SpeciesRepository;

	beforeEach(async () => {
		tempDir = await mkdtemp(path.join(tmpdir(), "bird-engine-"));
		dataFile = path.join(tempDir, "species.data.json");
		await writeFile(dataFile, "[]", "utf8");
		repository = speciesRepositoryFactory({ dataDir: tempDir });
	});

	afterEach(async () => {
		await rm(tempDir, {
			recursive: true,
			force: true,
		});
	});

	async function seedSpecies(species: Species[]) {
		await writeFile(dataFile, JSON.stringify(species, null, 2), "utf8");
	}

	it("retrieves an empty list of species", async () => {
		const species = await repository.getSpecies();
		expect(species).toEqual([]);
	});

	it("retrieves a list of species", async () => {
		await seedSpecies([testSpecies, testSpecies2]);

		const species = await repository.getSpecies();
		expect(species).toHaveLength(2);
		expect(species[0]).toEqual(testSpecies);
		expect(species[1]).toEqual(testSpecies2);
	});

	it("retrieves a species by id", async () => {
		await seedSpecies([testSpecies, testSpecies2]);

		const species = await repository.getSpeciesById("1");
		expect(species).toEqual(testSpecies);

		const species2 = await repository.getSpeciesById("2");
		expect(species2).toEqual(testSpecies2);

		const nonExistentSpecies = await repository.getSpeciesById("3");
		expect(nonExistentSpecies).toBeUndefined();
	});

	it("creates a species", async () => {
		await repository.addSpeciesToRepository(testSpecies);

		const species = await repository.getSpecies();

		expect(species).toHaveLength(1);
		expect(species[0]).toEqual(testSpecies);
	});

	it("deletes a species", async () => {
		await seedSpecies([testSpecies, testSpecies2]);

		await repository.deleteSpeciesFromRepository("1");

		const species = await repository.getSpecies();
		expect(species).toHaveLength(1);
		expect(species[0].speciesId).toBe("2");
	});

	it("updates a species", async () => {
		await seedSpecies([testSpecies]);
		const updatedSpecies: Species = {
			...testSpecies,
			speciesName: "Updated Great Blue Heron",
			localeName: "Updated Heron",
		};

		await repository.updateSpeciesInRepository(updatedSpecies);

		const species = await repository.getSpecies();
		expect(species).toHaveLength(1);
		expect(species[0]).toEqual(updatedSpecies);
	});
});
