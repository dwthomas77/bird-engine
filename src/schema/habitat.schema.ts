export const HabitatSchema = {
  $id: "api/habitat",
  title: "Habitat",
  description: "A habitat for birds",
  type: "object",
  properties: {
    "habitatId": {
      type: "string",
    },
    "habitatName": {
      type: "string",
    },
    "habitatDescription": {
      type: "string",
    },
  },
  "required": ["habitatId", "habitatName", "habitatDescription"],
  "additionalProperties": false
} as const;

export const HabitatRequestSchema = {
  $id: "api/habitat/request",
  title: "Habitat Request",
  description: "A request for a habitat",
  type: "object",
  properties: {
    "habitatName": {
      type: "string",
    },
    "habitatDescription": {
      type: "string",
    },
  },
  "required": ["habitatName", "habitatDescription"],
  "additionalProperties": false
} as const;
