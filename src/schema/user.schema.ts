import { schemaId } from "./ids.js";
export const UserSchema = {
  $id: schemaId("user"),
  title: "User",
  description: "A user",
  type: "object",
  properties: {
    userId: { type: "string" },
    displayName: { type: "string" },
  },
  required: ["userId", "displayName"],
  additionalProperties: false,
} as const;

export const UserRequestSchema = {
  $id: schemaId("user/request"),
  title: "User Request",
  description: "A request to create or update a user",
  type: "object",
  properties: {
    displayName: { type: "string" },
  },
  required: ["displayName"],
  additionalProperties: false,
} as const;
