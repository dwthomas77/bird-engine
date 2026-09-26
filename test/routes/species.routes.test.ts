import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { buildApp } from "../../src/app.js";
import type { Species, SpeciesRequest } from "../../src/types.js";

const peregrine: Species = {
	speciesId: "species-1",
	speciesName: "Peregrine Falcon",
	family: "Falconidae",
	genus: "Falco",
	localeName: "Peregrine",
	lengthMin: 34,
	lengthMax: 58,
	weightMin: 0.7,
	weightMax: 1.5,
	wingspanMin: 74,
	wingspanMax: 120,
};

const eagle: Species = {
	speciesId: "species-2",
	speciesName: "Golden Eagle",
	family: "Accipitridae",
	genus: "Aquila",
	localeName: "Golden Eagle",
	lengthMin: 70,
	lengthMax: 84,
	weightMin: 2.5,
	weightMax: 6.6,
	wingspanMin: 185,
	wingspanMax: 227,
};

describe("Species routes", () => {
	const testDir = path.join(process.cwd(), "test", "temp", "species");

	let app!: FastifyInstance;

	beforeEach(async () => {
		await fs.mkdir(testDir, { recursive: true });

		await Promise.all([
			fs.writeFile(path.join(testDir, "species.data.json"), "[]"),
			fs.writeFile(path.join(testDir, "habitats.data.json"), "[]"),
			fs.writeFile(path.join(testDir, "habitatSpecies.data.json"), "[]"),
		]);

		app = await buildApp({
			dataFilePath: testDir,
		});
	});

	afterEach(async () => {
		await app.close();
	});

	it("returns an empty list", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/species",
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([]);
	});

	it("returns all species", async () => {
		await fs.writeFile(
			path.join(testDir, "species.data.json"),
			JSON.stringify([peregrine, eagle]),
		);

		const response = await app.inject({ method: "GET", url: "/species" });

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual([
			{ ...peregrine, habitats: [] },
			{ ...eagle, habitats: [] },
		]);
	});

	it("returns a species by id", async () => {
		await fs.writeFile(
			path.join(testDir, "species.data.json"),
			JSON.stringify([peregrine]),
		);

		const response = await app.inject({
			method: "GET",
			url: "/species/species-1",
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({ ...peregrine, habitats: [] });
	});

	it("returns not found for an unknown species id", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/species/unknown",
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toMatchObject({
			type: "NOT_FOUND_ERROR",
			detail: "Species not found",
		});
	});

	it("creates a species", async () => {
		const creationPayload: SpeciesRequest = {
			speciesName: peregrine.speciesName,
			family: peregrine.family,
			genus: peregrine.genus,
			localeName: peregrine.localeName,
			lengthMin: peregrine.lengthMin,
			lengthMax: peregrine.lengthMax,
			weightMin: peregrine.weightMin,
			weightMax: peregrine.weightMax,
			wingspanMin: peregrine.wingspanMin,
			wingspanMax: peregrine.wingspanMax,
			habitats: [],
		};

		const response = await app.inject({
			method: "POST",
			url: "/species",
			payload: creationPayload,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			...creationPayload,
			speciesId: expect.any(String),
		});
	});

	it("deletes a species", async () => {
		await fs.writeFile(
			path.join(testDir, "species.data.json"),
			JSON.stringify([peregrine, eagle]),
		);

		const response = await app.inject({
			method: "DELETE",
			url: "/species/species-1",
		});

		expect(response.statusCode).toBe(204);
		expect(response.body).toBe("");
	});

	it("returns not found when deleting an unknown species", async () => {
		const response = await app.inject({
			method: "DELETE",
			url: "/species/unknown",
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toMatchObject({
			type: "NOT_FOUND_ERROR",
			detail: "Species not found",
		});
	});

	it("updates a species", async () => {
		await fs.writeFile(
			path.join(testDir, "species.data.json"),
			JSON.stringify([peregrine]),
		);

		const updatePayload: SpeciesRequest = {
			speciesName: "Barbary Falcon",
			family: peregrine.family,
			genus: peregrine.genus,
			localeName: peregrine.localeName,
			lengthMin: peregrine.lengthMin,
			lengthMax: peregrine.lengthMax,
			weightMin: peregrine.weightMin,
			weightMax: peregrine.weightMax,
			wingspanMin: peregrine.wingspanMin,
			wingspanMax: peregrine.wingspanMax,
			habitats: [],
		};

		const response = await app.inject({
			method: "PUT",
			url: "/species/species-1",
			payload: updatePayload,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			...updatePayload,
			speciesId: peregrine.speciesId,
			habitats: [],
		});
	});

	it("returns not found when updating an unknown species", async () => {
		const response = await app.inject({
			method: "PUT",
			url: "/species/unknown",
			payload: {
				speciesName: peregrine.speciesName,
				family: peregrine.family,
				genus: peregrine.genus,
				localeName: peregrine.localeName,
				lengthMin: peregrine.lengthMin,
				lengthMax: peregrine.lengthMax,
				weightMin: peregrine.weightMin,
				weightMax: peregrine.weightMax,
				wingspanMin: peregrine.wingspanMin,
				wingspanMax: peregrine.wingspanMax,
				habitats: [],
			},
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toMatchObject({
			type: "NOT_FOUND_ERROR",
			detail: "Species not found",
		});
	});
});
