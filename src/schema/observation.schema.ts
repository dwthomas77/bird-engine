import { schemaId, schemaRef } from "./ids.js";
const baseObservationProperties = {
  "journalId": { type: "string" },
  "bird": { "$ref": schemaRef("bird") },
  "location": { "$ref": schemaRef("location") },
  "observedAt": { type: "string", format: "date-time" },
  "quantity": { type: "number" },
  "notes": { type: "string" },
} as const;

const requiredObservationProperties = ["journalId", "bird", "location", "observedAt", "quantity"] as const;

export const ObservationSchema = {
  $id: schemaId("observation"),
  title: "Observation", 
  description: "An observation of a bird in a habitat",
  type: "object",
  properties: {
    ...baseObservationProperties,
    "observationId": { type: "string" },
  },
  "required": ["observationId", ...requiredObservationProperties],
  "additionalProperties": false
} as const;

export const ObservationRequestSchema = {
  $id: schemaId("observation/request"),
  title: "Observation Request",
  description: "A request for an observation",
  type: "object",
  properties: {
    ...baseObservationProperties,
  },
  "required": requiredObservationProperties,
  "additionalProperties": false
} as const;
