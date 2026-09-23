import type { Habitat, HabitatRequest } from "../types.js";
import fs from "fs/promises";
import { InternalServerError } from "../errors.js";

export interface HabitatRepository {
  getHabitats(): Promise<Habitat[]>;
  addHabitatToRepository(newHabitat: Habitat): Promise<Habitat>;
  getHabitatById(habitatId: string): Promise<Habitat | undefined>;
  deleteHabitatFromRepository(habitatId: string): Promise<void>;
  updateHabitatInRepository(
    uid: string,
    updatedHabitat: HabitatRequest,
  ): Promise<Habitat>;
}

export function habitatRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): HabitatRepository {
  let cachedHabitats: Habitat[] | null = null;
  const fileUrl = new URL(`${dataDir}/habitats.data.json`, import.meta.url);

  return {
    async getHabitats(): Promise<Habitat[]> {
      if (cachedHabitats) return cachedHabitats;
      const raw = await fs.readFile(fileUrl, "utf-8");
      const parsed = JSON.parse(raw) as Habitat[];
      cachedHabitats = parsed || [];
      return cachedHabitats;
    },

    async addHabitatToRepository(newHabitat: Habitat): Promise<Habitat> {
      try {
        // Ensure we have current data (from cache or file)
        let habitats = cachedHabitats;
        if (!habitats) {
          const raw = await fs.readFile(fileUrl, "utf-8");
          habitats = JSON.parse(raw) as Habitat[];
        }

        // Add new habitat
        habitats.push(newHabitat);

        // Write back to file
        await fs.writeFile(fileUrl, JSON.stringify(habitats, null, 2), "utf-8");

        // Update cache
        cachedHabitats = habitats;

        return newHabitat;
      } catch (error) {
        // Re-throw so calling layer can handle/log
        throw new InternalServerError(
          `Failed to add habitat by id ${newHabitat.habitatId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },

    async getHabitatById(habitatId: string): Promise<Habitat | undefined> {
      try {
        let habitats = cachedHabitats;
        if (!habitats) {
          const raw = await fs.readFile(fileUrl, "utf-8");
          habitats = JSON.parse(raw) as Habitat[];
          cachedHabitats = habitats;
        }

        return habitats.find((habitat) => habitat.habitatId === habitatId);
      } catch (error) {
        throw new InternalServerError(
          `Failed to get habitat by id ${habitatId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },

    async deleteHabitatFromRepository(habitatId: string): Promise<void> {
      try {
        let habitats = cachedHabitats;
        if (!habitats) {
          const raw = await fs.readFile(fileUrl, "utf-8");
          habitats = JSON.parse(raw) as Habitat[];
        }

        const updatedHabitats = habitats.filter(
          (habitat) => habitat.habitatId !== habitatId,
        );

        if (updatedHabitats.length === habitats.length) {
          return;
        }

        await fs.writeFile(
          fileUrl,
          JSON.stringify(updatedHabitats, null, 2),
          "utf-8",
        );
        cachedHabitats = updatedHabitats;
      } catch (error) {
        throw new InternalServerError(
          `Failed to delete habitat by id ${habitatId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },

    async updateHabitatInRepository(
      habitatId: string,
      updatedHabitat: HabitatRequest,
    ): Promise<Habitat> {
      try {
        // Ensure we have current data
        let habitats = cachedHabitats;
        if (!habitats) {
          const raw = await fs.readFile(fileUrl, "utf-8");
          habitats = JSON.parse(raw) as Habitat[];
        }

        // Find existing habitat
        const habitatIndex = habitats.findIndex(
          (h) => h.habitatId === habitatId,
        );

        if (habitatIndex === -1) {
          throw new Error(
            `Habitat with id ${updatedHabitat.habitatId} not found`,
          );
        }

        const updatedHabitatWithId: Habitat = {
          habitatId,
          ...updatedHabitat,
        };

        // Replace existing habitat
        habitats[habitatIndex] = updatedHabitatWithId;

        // Persist changes
        await fs.writeFile(fileUrl, JSON.stringify(habitats, null, 2), "utf-8");

        // Update cache
        cachedHabitats = habitats;
        return updatedHabitatWithId;
      } catch (error) {
        throw new InternalServerError(
          `Failed to update habitat: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  };
}
