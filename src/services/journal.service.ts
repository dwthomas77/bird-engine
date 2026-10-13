import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { JournalRepository } from "../repositories/journal.repository.js";
import type { UserService } from "./user.service.js";
import type { ObservationService } from "./observation.service.js";
import type { Journal, JournalRequest, JournalSummary } from "../types.js";

export interface JournalService {
  getJournalsService(userId?: string): Promise<JournalSummary[]>;
  addJournalService(newJournal: JournalRequest): Promise<Journal>;
  getJournalByIdService(journalId: string): Promise<Journal>;
  getJournalSummaryByIdService(journalId: string): Promise<JournalSummary>;
  updateJournalService(
    journalId: string,
    updatedJournal: JournalRequest,
  ): Promise<Journal>;
  removeJournalService(journalId: string): Promise<void>;
}

export function journalServiceFactory({
  journalRepository,
  userService,
  observationService,
}: {
  journalRepository: JournalRepository;
  userService: UserService;
  observationService: ObservationService;
}): JournalService {
  
    async function getJournalSummaryByIdService(journalId: string): Promise<JournalSummary> {
    const journal: Journal | undefined = await journalRepository.getJournalById(journalId);
    if(!journal) {
      throw new NotFoundError("Journal not found", {
        journalId: "Journal ID does not exist",
      });
    }
    const { userId, displayName } = await userService.getUserByIdService(journal.userId || "");
    if(!userId) {
      throw new NotFoundError("User not found", {
        userId: "User ID does not exist",
      });
    }
    
    const entryCount = await observationService.getObservationCountbyJournalService(journal.journalId);
    return {
      journalId: journal.journalId,
      name: journal.name,
      description: journal.description || undefined,
      createdAt: journal.createdAt,
      updatedAt: journal.updatedAt,
      owner: {
        userId,
        displayName,
      },
      entryCount: entryCount || 0,
    };
  }
  
  async function getJournalsService(userId?: string): Promise<JournalSummary[]> {
    const journals = await journalRepository.getJournals();
    const filteredJournals = userId === undefined
      ? journals
      : journals.filter((journal) => journal.userId === userId);
    return Promise.all(filteredJournals.map(async (journal) => getJournalSummaryByIdService(journal.journalId)));
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
    getJournalSummaryByIdService,
  };
}