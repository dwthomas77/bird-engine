import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { buildApp } from "../../src/app.js";
import type { Journal, JournalRequest } from "../../src/types.js";

const journalRequest: JournalRequest = {
  userId: "user-1",
  name: "Spring observations",
  description: "Bird sightings from spring",
  createdAt: "2026-03-01T09:00:00.000Z",
  updatedAt: "2026-03-01T09:00:00.000Z",
};

describe("Journal routes", () => {
  let testDir: string;
  let app!: FastifyInstance;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(tmpdir(), "bird-engine-journal-"));
    await fs.writeFile(path.join(testDir, "journals.data.json"), "[]");
    app = await buildApp({ dataFilePath: testDir });
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("lists an empty collection", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/journals",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("creates, retrieves, updates, and deletes a journal", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/journals",
      payload: journalRequest,
    });
    expect(createResponse.statusCode).toBe(200);
    const createdJournal = createResponse.json<Journal>();
    expect(createdJournal).toEqual({
      ...journalRequest,
      journalId: expect.any(String),
    });

    const getResponse = await app.inject({
      method: "GET",
      url: `/journals/${createdJournal.journalId}`,
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual(createdJournal);

    const updatedRequest: JournalRequest = {
      ...journalRequest,
      name: "Updated spring observations",
      updatedAt: "2026-03-02T09:00:00.000Z",
    };
    const updateResponse = await app.inject({
      method: "PUT",
      url: `/journals/${createdJournal.journalId}`,
      payload: updatedRequest,
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toEqual({
      ...updatedRequest,
      journalId: createdJournal.journalId,
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/journals/${createdJournal.journalId}`,
    });
    expect(deleteResponse.statusCode).toBe(204);
    expect(
      JSON.parse(
        await fs.readFile(path.join(testDir, "journals.data.json"), "utf-8"),
      ),
    ).toEqual([]);
  });

  it("rejects a request missing required journal fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/journals",
      payload: { name: "Incomplete journal" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns not found for an unknown journal", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/journals/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "Journal not found",
    });
  });
});
