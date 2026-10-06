import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { JournalRepository } from "../repositories/journal.repository.js";
import type { Journal, JournalRequest } from "../types.js";

export interface JournalService {
  getJournalsService(userId?: string): Promise<Journal[]>;
  addJournalService(newJournal: JournalRequest): Promise<Journal>;
  getJournalByIdService(journalId: string): Promise<Journal>;
  updateJournalService(
    journalId: string,
    updatedJournal: JournalRequest,
  ): Promise<Journal>;
  removeJournalService(journalId: string): Promise<void>;
}

export function journalServiceFactory({
  journalRepository,
}: {
  journalRepository: JournalRepository;
}): JournalService {
  async function getJournalsService(userId?: string): Promise<Journal[]> {
    const journals = await journalRepository.getJournals();
    return userId === undefined
      ? journals
      : journals.filter((journal) => journal.userId === userId);
  }

  async function addJournalService(
    newJournal: JournalRequest,
  ): Promise<Journal> {
    return journalRepository.addJournalToRepository({
      ...newJournal,
      journalId: randomUUID(),
    });
  }

  async function getJournalByIdService(journalId: string): Promise<Journal> {
    const journal = await journalRepository.getJournalById(journalId);
    if (!journal) {
      throw new NotFoundError("Journal not found", {
        journalId: "Journal ID does not exist",
      });
    }
    return journal;
  }

  async function updateJournalService(
    journalId: string,
    updatedJournal: JournalRequest,
  ): Promise<Journal> {
    await getJournalByIdService(journalId);
    return journalRepository.updateJournalInRepository({
      ...updatedJournal,
      journalId,
    });
  }

  async function removeJournalService(journalId: string): Promise<void> {
    await getJournalByIdService(journalId);
    await journalRepository.deleteJournalFromRepository(journalId);
  }

  return {
    getJournalsService,
    addJournalService,
    getJournalByIdService,
    updateJournalService,
    removeJournalService,
  };
}
