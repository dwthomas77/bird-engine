import type { Habitat } from '../../types.js';
import fs from 'fs/promises';
import { InternalServerError } from '../../errors.js';

let cachedHabitats: Habitat[] | null = null;

export async function getHabitats(): Promise<Habitat[]> {
	if (cachedHabitats) return cachedHabitats;

	const fileUrl = new URL('./data/habitats.json', import.meta.url);
	const raw = await fs.readFile(fileUrl, 'utf-8');
	const parsed = JSON.parse(raw) as Habitat[];

	cachedHabitats = parsed || [];
	//return cachedHabitats;
	return [];
}


export async function addHabitatToRepository(
    newHabitat: Habitat
): Promise<Habitat> {
    try {
        const fileUrl = new URL('./data/habitats.json', import.meta.url);

        // Ensure we have current data (from cache or file)
        let habitats = cachedHabitats;
        if (!habitats) {
            const raw = await fs.readFile(fileUrl, 'utf-8');
            habitats = JSON.parse(raw) as Habitat[];
        }

        // Add new habitat
        habitats.push(newHabitat);

        // Write back to file
        await fs.writeFile(fileUrl, JSON.stringify(habitats, null, 2), 'utf-8');

        // Update cache
        cachedHabitats = habitats;

        return newHabitat;
    } catch (error) {
        // Re-throw so calling layer can handle/log
        throw new InternalServerError(
            `Failed to add habitat by id ${newHabitat.habitatId}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

export async function gethHabitatById(
    habitatId: string
): Promise<Habitat | undefined> {
    try {
        let habitats = cachedHabitats;
        if (!habitats) {
            const fileUrl = new URL('./data/habitats.json', import.meta.url);
            const raw = await fs.readFile(fileUrl, 'utf-8');
            habitats = JSON.parse(raw) as Habitat[];
            cachedHabitats = habitats;
        }

        return habitats.find((habitat) => habitat.habitatId === habitatId);
    } catch (error) {
        throw new InternalServerError(
            `Failed to get habitat by id ${habitatId}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

export async function deleteHabitatFromRepository(
    habitatId: string
): Promise<void> {
    try {
        const fileUrl = new URL('./data/habitats.json', import.meta.url);

        let habitats = cachedHabitats;
        if (!habitats) {
            const raw = await fs.readFile(fileUrl, 'utf-8');
            habitats = JSON.parse(raw) as Habitat[];
        }

        const updatedHabitats = habitats.filter(
            (habitat) => habitat.habitatId !== habitatId
        );

        if (updatedHabitats.length === habitats.length) {
            return;
        }

        await fs.writeFile(fileUrl, JSON.stringify(updatedHabitats, null, 2), 'utf-8');
        cachedHabitats = updatedHabitats;
    } catch (error) {
        throw new InternalServerError(
            `Failed to delete habitat by id ${habitatId}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

export async function updateHabitatInRepository(
    updatedHabitat: Habitat
): Promise<Habitat> {
    try {
        const fileUrl = new URL('./data/habitats.json', import.meta.url);

        // Ensure we have current data
        let habitats = cachedHabitats;
        if (!habitats) {
            const raw = await fs.readFile(fileUrl, 'utf-8');
            habitats = JSON.parse(raw) as Habitat[];
        }

        // Find existing habitat
        const habitatIndex = habitats.findIndex(
            h => h.habitatId === updatedHabitat.habitatId
        );

        if (habitatIndex === -1) {
            throw new Error(
                `Habitat with id ${updatedHabitat.habitatId} not found`
            );
        }

        // Replace existing habitat
        habitats[habitatIndex] = updatedHabitat;

        // Persist changes
        await fs.writeFile(
            fileUrl,
            JSON.stringify(habitats, null, 2),
            'utf-8'
        );

        // Update cache
        cachedHabitats = habitats;

        return updatedHabitat;
    } catch (error) {
        throw new InternalServerError(
            `Failed to update habitat ${updatedHabitat.habitatId}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}
