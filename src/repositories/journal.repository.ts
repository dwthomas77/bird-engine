import fs from "node:fs/promises";
import type { Journal } from "../types.js";
import { InternalServerError } from "../errors.js";

export interface JournalRepository {
  getJournals(): Promise<Journal[]>;
  addJournalToRepository(journal: Journal): Promise<Journal>;
  getJournalById(journalId: string): Promise<Journal | undefined>;
  updateJournalInRepository(journal: Journal): Promise<Journal>;
  deleteJournalFromRepository(journalId: string): Promise<void>;
}

export function journalRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): JournalRepository {
  const fileUrl = new URL(`${dataDir}/journals.data.json`, import.meta.url);
  let cachedJournals: Journal[] | null = null;

  async function readJournals(): Promise<Journal[]> {
    if (cachedJournals) return cachedJournals;
    const raw = await fs.readFile(fileUrl, "utf-8");
    cachedJournals = JSON.parse(raw) as Journal[];
    return cachedJournals;
  }

  async function writeJournals(journals: Journal[]): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(journals, null, 2), "utf-8");
    cachedJournals = journals;
  }

  async function getJournals(): Promise<Journal[]> {
    try {
      return await readJournals();
    } catch (error) {
      throw new InternalServerError(
        `Failed to get journals: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function addJournalToRepository(journal: Journal): Promise<Journal> {
    try {
      const journals = await readJournals();
      journals.push(journal);
      await writeJournals(journals);
      return journal;
    } catch (error) {
      throw new InternalServerError(
        `Failed to add journal ${journal.journalId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function getJournalById(
    journalId: string,
  ): Promise<Journal | undefined> {
    try {
      return (await readJournals()).find(
        (journal) => journal.journalId === journalId,
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to get journal ${journalId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function updateJournalInRepository(
    journal: Journal,
  ): Promise<Journal> {
    try {
      const journals = await readJournals();
      const index = journals.findIndex(
        (item) => item.journalId === journal.journalId,
      );
      if (index === -1) throw new Error(`Journal ${journal.journalId} not found`);
      journals[index] = journal;
      await writeJournals(journals);
      return journal;
    } catch (error) {
      throw new InternalServerError(
        `Failed to update journal ${journal.journalId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function deleteJournalFromRepository(journalId: string): Promise<void> {
    try {
      const journals = await readJournals();
      await writeJournals(
        journals.filter((journal) => journal.journalId !== journalId),
      );
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete journal ${journalId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    getJournals,
    addJournalToRepository,
    getJournalById,
    updateJournalInRepository,
    deleteJournalFromRepository,
  };
}
