import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { buildApp } from "../../src/app.js";
import type {
  ObservationGroup,
  ObservationGroupRequest,
} from "../../src/types.js";

const groupRequest: ObservationGroupRequest = {
  name: "Waterfowl",
  parentId: "parent-1",
};

describe("ObservationGroup routes", () => {
  let testDir: string;
  let app!: FastifyInstance;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(tmpdir(), "bird-engine-obsgroup-"));
    await fs.writeFile(path.join(testDir, "observationGroups.data.json"), "[]");
    app = await buildApp({ dataFilePath: testDir });
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("lists an empty collection", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/observation-groups",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("creates, retrieves, lists, updates, and deletes a group", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/observation-groups",
      payload: groupRequest,
    });
    expect(createResponse.statusCode).toBe(200);
    const created = createResponse.json<ObservationGroup>();
    expect(created).toEqual({
      ...groupRequest,
      observationGroupId: expect.any(String),
    });

    const getResponse = await app.inject({
      method: "GET",
      url: `/observation-groups/${created.observationGroupId}`,
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual(created);

    const listResponse = await app.inject({
      method: "GET",
      url: "/observation-groups",
    });
    expect(listResponse.json()).toEqual([created]);

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/observation-groups/${created.observationGroupId}`,
      payload: { name: "Shorebirds" },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toEqual({
      name: "Shorebirds",
      observationGroupId: created.observationGroupId,
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/observation-groups/${created.observationGroupId}`,
    });
    expect(deleteResponse.statusCode).toBe(204);
    expect(
      JSON.parse(
        await fs.readFile(
          path.join(testDir, "observationGroups.data.json"),
          "utf-8",
        ),
      ),
    ).toEqual([]);
  });

  it("rejects a request missing required fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/observation-groups",
      payload: { parentId: "parent-1" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns not found for an unknown group", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/observation-groups/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "Observation group not found",
    });
  });

  it("returns not found when updating or deleting an unknown group", async () => {
    const put = await app.inject({
      method: "PUT",
      url: "/observation-groups/missing",
      payload: groupRequest,
    });
    expect(put.statusCode).toBe(404);

    const del = await app.inject({
      method: "DELETE",
      url: "/observation-groups/missing",
    });
    expect(del.statusCode).toBe(404);
  });
});
