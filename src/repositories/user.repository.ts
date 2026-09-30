import fs from "node:fs/promises";
import type { User } from "../types.js";
import { InternalServerError } from "../errors.js";

export interface UserRepository {
  getUsers(): Promise<User[]>;
  addUserToRepository(user: User): Promise<User>;
  getUserById(userId: string): Promise<User | undefined>;
  updateUserInRepository(user: User): Promise<User>;
  deleteUserFromRepository(userId: string): Promise<void>;
}

export function userRepositoryFactory({
  dataDir,
}: {
  dataDir: string;
}): UserRepository {
  const fileUrl = new URL(`${dataDir}/users.data.json`, import.meta.url);
  let cachedUsers: User[] | null = null;

  async function readUsers(): Promise<User[]> {
    if (cachedUsers) return cachedUsers;
    const raw = await fs.readFile(fileUrl, "utf-8");
    cachedUsers = JSON.parse(raw) as User[];
    return cachedUsers;
  }

  async function writeUsers(users: User[]): Promise<void> {
    await fs.writeFile(fileUrl, JSON.stringify(users, null, 2), "utf-8");
    cachedUsers = users;
  }

  async function getUsers(): Promise<User[]> {
    try {
      return await readUsers();
    } catch (error) {
      throw new InternalServerError(
        `Failed to get users: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function addUserToRepository(user: User): Promise<User> {
    try {
      const users = await readUsers();
      users.push(user);
      await writeUsers(users);
      return user;
    } catch (error) {
      throw new InternalServerError(
        `Failed to add user ${user.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function getUserById(userId: string): Promise<User | undefined> {
    try {
      return (await readUsers()).find((user) => user.userId === userId);
    } catch (error) {
      throw new InternalServerError(
        `Failed to get user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function updateUserInRepository(user: User): Promise<User> {
    try {
      const users = await readUsers();
      const index = users.findIndex((item) => item.userId === user.userId);
      if (index === -1) throw new Error(`User ${user.userId} not found`);
      users[index] = user;
      await writeUsers(users);
      return user;
    } catch (error) {
      throw new InternalServerError(
        `Failed to update user ${user.userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function deleteUserFromRepository(userId: string): Promise<void> {
    try {
      const users = await readUsers();
      await writeUsers(users.filter((user) => user.userId !== userId));
    } catch (error) {
      throw new InternalServerError(
        `Failed to delete user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    getUsers,
    addUserToRepository,
    getUserById,
    updateUserInRepository,
    deleteUserFromRepository,
  };
}
