import fs from "fs/promises";
import { InternalServerError } from "../errors.js";
import type { HabitatSpeciesRelationship } from "../types.js";

export interface HabitatSpeciesRepository {
	getRelationships(): Promise<HabitatSpeciesRelationship[]>;
	addRelationship(habitatId: string, speciesId: string): Promise<void>;
	removeRelationship(habitatId: string, speciesId: string): Promise<void>;
	synchronizeHabitats(
		speciesId: string,
		habitatIds: string[],
	): Promise<void>;
}

export function habitatSpeciesRepositoryFactory({
	dataDir,
}: {
	dataDir: string;
}): HabitatSpeciesRepository {
	const fileUrl = new URL(`${dataDir}/habitatSpecies.data.json`, import.meta.url);
	let cachedRelationships: HabitatSpeciesRelationship[] | null = null;

	async function readRelationshipsFile(): Promise<HabitatSpeciesRelationship[]> {
		const raw = await fs.readFile(fileUrl, "utf-8");
		return (JSON.parse(raw) as HabitatSpeciesRelationship[]) || [];
	}

	async function writeRelationships(
		relationships: HabitatSpeciesRelationship[],
	): Promise<void> {
		await fs.writeFile(
			fileUrl,
			JSON.stringify(relationships, null, 2),
			"utf-8",
		);
		cachedRelationships = relationships;
	}

	async function getRelationships(): Promise<HabitatSpeciesRelationship[]> {
		if (!cachedRelationships) {
			cachedRelationships = await readRelationshipsFile();
		}
		return cachedRelationships;
	}

	async function addRelationship(
		habitatId: string,
		speciesId: string,
	): Promise<void> {
		try {
			const relationships = await getRelationships();
			const alreadyExists = relationships.some(
				(relationship) =>
					relationship.habitatId === habitatId &&
					relationship.speciesId === speciesId,
			);
			if (!alreadyExists) {
				await writeRelationships([
					...relationships,
					{ habitatId, speciesId },
				]);
			}
		} catch (error) {
			throw new InternalServerError(
				`Failed to add relationship between habitat ${habitatId} and species ${speciesId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async function removeRelationship(
		habitatId: string,
		speciesId: string,
	): Promise<void> {
		try {
			const relationships = await getRelationships();
			await writeRelationships(
				relationships.filter(
					(relationship) =>
						relationship.habitatId !== habitatId ||
						relationship.speciesId !== speciesId,
				),
			);
		} catch (error) {
			throw new InternalServerError(
				`Failed to remove relationship between habitat ${habitatId} and species ${speciesId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async function synchronizeHabitats(
		speciesId: string,
		habitatIds: string[],
	): Promise<void> {
		try {
			const relationships = await getRelationships();
			const retainedRelationships = relationships.filter(
				(relationship) =>
				relationship.speciesId !== speciesId ||
				habitatIds.includes(relationship.habitatId),
			);
			const replacementRelationships = habitatIds
				.filter(
					(habitatId) =>
						!retainedRelationships.some(
							(relationship) =>
								relationship.speciesId === speciesId &&
								relationship.habitatId === habitatId,
						),
				)
				.map((habitatId) => ({
					habitatId,
					speciesId,
				}));
			await writeRelationships([
				...retainedRelationships,
				...replacementRelationships,
			]);
		} catch (error) {
			throw new InternalServerError(
				`Failed to replace habitats for species ${speciesId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	return {
		getRelationships,
		addRelationship,
		removeRelationship,
		synchronizeHabitats,
	};
}
