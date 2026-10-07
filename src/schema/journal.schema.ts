const baseJournalProperties = {
  "userId": { type: "string" },
  "name": { type: "string" },
  "description": { type: "string" },
  "createdAt": { type: "string", format: "date-time" },
  "updatedAt": { type: "string", format: "date-time" },
} as const;

const requiredJournalProperties = ["userId", "name", "createdAt", "updatedAt"] as const;

export const JournalSchema = {
  $id: "https://bird-engine.local/api/journal",
  title: "Journal",
  description: "A journal of bird observations",
  type: "object",
  properties: {
    ...baseJournalProperties,
    "journalId": { type: "string" },
  },
  "required": ["journalId", ...requiredJournalProperties],
  "additionalProperties": false
} as const;

export const JournalRequestSchema = {
  $id: "https://bird-engine.local/api/journal/request",
  title: "Journal Request",
  description: "A request to create a journal of bird observations",
  type: "object",
  properties: {
    ...baseJournalProperties,
  },
  "required": requiredJournalProperties,
  "additionalProperties": false
} as const;