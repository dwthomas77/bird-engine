import { schemaId } from "./ids.js";
const baseJournalProperties = {
  userId: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
} as const;

const requiredJournalProperties = [
  "userId",
  "name",
] as const;

export const JournalSchema = {
  $id: schemaId("journal"),
  title: "Journal",
  description: "A journal of bird observations",
  type: "object",
  properties: {
    ...baseJournalProperties,
    journalId: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["journalId", "createdAt", "updatedAt", ...requiredJournalProperties],
  additionalProperties: false,
} as const;

export const JournalRequestSchema = {
  $id: schemaId("journal/request"),
  title: "Journal Request",
  description: "A request to create a journal of bird observations",
  type: "object",
  properties: {
    ...baseJournalProperties,
  },
  required: requiredJournalProperties,
  additionalProperties: false,
} as const;

export const JournalSummarySchema = {
  $id: schemaId("journal/summary"),
  title: "Journal Summary",
  description: "A summary of a journal of bird observations",
  type: "object",
  properties: {
    journalId: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    owner: {
      type: "object",
      properties: {
        userId: { type: "string" },
        displayName: { type: "string" },
      },
    },
    entryCount: { type: "integer" },
  },
  required: [
    "journalId",
    "name",
    "createdAt",
    "updatedAt",
    "owner",
    "entryCount",
  ],
} as const;
