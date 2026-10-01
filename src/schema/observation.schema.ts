const baseObservationProperties = {
  "speciesId": { type: "string" },
  "locationId": { "$ref": "https://bird-engine.local/api/location#" },
  "observedAt": { type: "string", format: "date-time" },
  "quantity": { type: "number" },
  "notes": { type: "string" },
} as const;

const requiredObservationProperties = ["speciesId", "locationId", "observedAt", "quantity"] as const;

export const ObservationSchema = {
  $id: "api/observation",
  title: "Observation", 
  description: "An observation of a habitat",
  type: "object",
  properties: {
    ...baseObservationProperties,
    "observationId": { type: "string" },
  },
  "required": ["observationId", ...requiredObservationProperties],
  "additionalProperties": false
} as const;

export const ObservationRequestSchema = {
  $id: "api/observation/request",
  title: "Observation Request",
  description: "A request for an observation",
  type: "object",
  properties: {
    ...baseObservationProperties,
  },
  "required": requiredObservationProperties,
  "additionalProperties": false
} as const;
