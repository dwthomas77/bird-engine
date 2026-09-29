const baseHabitatProperties = {
  "code": { type: "string" },
  "name": { type: "string" },
  "parentHabitatId": { type: "string" },
  "description": { type: "string" },
} as const;

export const HabitatSchema = {
  $id: "api/habitat",
  title: "Habitat", 
  description: "A habitat for birds",
  type: "object",
  properties: {
    ...baseHabitatProperties,
    "habitatId": { type: "string" },
  },
  "required": ["habitatId", "code", "name"],
  "additionalProperties": false
} as const;

export const HabitatRequestSchema = {
  $id: "api/habitat/request",
  title: "Habitat Request",
  description: "A request for a habitat",
  type: "object",
  properties: {
    ...baseHabitatProperties,
  },
  "required": ["code", "name"],
  "additionalProperties": false
} as const;
