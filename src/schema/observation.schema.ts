const baseObservationProperties = {
  "journalId": { type: "string" },
  "bird": { "$ref": "https://bird-engine.local/api/bird#" },
  "location": { "$ref": "https://bird-engine.local/api/location#" },
  "observedAt": { type: "string", format: "date-time" },
  "quantity": { type: "number" },
  "notes": { type: "string" },
} as const;

const requiredObservationProperties = ["journalId", "bird", "location", "observedAt", "quantity"] as const;

export const ObservationSchema = {
  $id: "https://bird-engine.local/api/observation",
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
  $id: "https://bird-engine.local/api/observation/request",
  title: "Observation Request",
  description: "A request for an observation",
  type: "object",
  properties: {
    ...baseObservationProperties,
  },
  "required": requiredObservationProperties,
  "additionalProperties": false
} as const;
