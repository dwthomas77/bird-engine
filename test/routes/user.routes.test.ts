import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { buildApp } from "../../src/app.js";
import type { User } from "../../src/types.js";

describe("User routes", () => {
  const testDir = path.join(process.cwd(), "test", "temp", "user");
  let app!: FastifyInstance;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(testDir, "users.data.json"), "[]"),
      fs.writeFile(path.join(testDir, "species.data.json"), "[]"),
      fs.writeFile(path.join(testDir, "habitats.data.json"), "[]"),
      fs.writeFile(path.join(testDir, "habitatSpecies.data.json"), "[]"),
    ]);
    app = await buildApp({ dataFilePath: testDir });
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates a user with a generated hash id", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: { displayName: "Ada" },
    });

    expect(response.statusCode).toBe(200);
    const createdUser = response.json() as User;
    expect(createdUser).toEqual({
      userId: expect.stringMatching(/^[a-f0-9]{64}$/),
      displayName: "Ada",
    });
    await expect(
      fs.readFile(path.join(testDir, "users.data.json"), "utf-8"),
    ).resolves.toContain(createdUser.userId);
  });

  it("lists, retrieves, updates, and deletes users", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/users",
      payload: { displayName: "Ada" },
    });
    const createdUser = createResponse.json() as User;

    const listResponse = await app.inject({
      method: "GET",
      url: "/users",
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toEqual([createdUser]);

    const getResponse = await app.inject({
      method: "GET",
      url: `/users/${createdUser.userId}`,
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual(createdUser);

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/users/${createdUser.userId}`,
      payload: { displayName: "Ada Lovelace" },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toEqual({
      ...createdUser,
      displayName: "Ada Lovelace",
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/users/${createdUser.userId}`,
    });
    expect(deleteResponse.statusCode).toBe(204);

    const usersFile = await fs.readFile(
      path.join(testDir, "users.data.json"),
      "utf-8",
    );
    expect(JSON.parse(usersFile)).toEqual([]);
  });

  it("rejects requests without a display name", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns not found for an unknown user", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/users/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      type: "NOT_FOUND_ERROR",
      detail: "User not found",
    });
  });
});
