import { createHash, randomBytes } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { User, UserRequest } from "../types.js";

export interface UserService {
  getUsersService(): Promise<User[]>;
  addUserService(newUser: UserRequest): Promise<User>;
  getUserByIdService(userId: string): Promise<User>;
  updateUserService(userId: string, updatedUser: UserRequest): Promise<User>;
  removeUserService(userId: string): Promise<void>;
}

export function userServiceFactory({
  userRepository,
}: {
  userRepository: UserRepository;
}): UserService {
  async function getUsersService(): Promise<User[]> {
    return userRepository.getUsers();
  }

  async function addUserService(newUser: UserRequest): Promise<User> {
    const user: User = {
      userId: createHash("sha256")
        .update(randomBytes(32))
        .digest("hex"),
      displayName: newUser.displayName,
    };
    return userRepository.addUserToRepository(user);
  }

  async function getUserByIdService(userId: string): Promise<User> {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found", {
        userId: "User ID does not exist",
      });
    }
    return user;
  }

  async function updateUserService(
    userId: string,
    updatedUser: UserRequest,
  ): Promise<User> {
    await getUserByIdService(userId);
    return userRepository.updateUserInRepository({
      userId,
      displayName: updatedUser.displayName,
    });
  }

  async function removeUserService(userId: string): Promise<void> {
    await getUserByIdService(userId);
    await userRepository.deleteUserFromRepository(userId);
  }

  return {
    getUsersService,
    addUserService,
    getUserByIdService,
    updateUserService,
    removeUserService,
  };
}
