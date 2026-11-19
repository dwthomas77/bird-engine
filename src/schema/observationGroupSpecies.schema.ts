import { schemaId } from "./ids.js";

const ObservationGroupSpeciesSchema = {
  $id: schemaId("observationGroup/species"),
  title: "Observation Group - Species",
  description: "A relationship between an Observation Group and a Species",
  type: "object",
  properties: {
    "observationGroupId": {
      type: "string",
    },
    "speciesId": {
      type: "string",
    },
    "excluded": { type: "boolean" },
  },
  "required": ["observationGroupId", "speciesId"],
  "additionalProperties": false
} as const;

const ObservationGroupSpeciesRequestSchema = {
  $id: schemaId("observationGroup/species/request"),
  title: "Observation Group - Species Request",
  description: "A request to create or update a relationship between an Observation Group and a Species",
  type: "object",
  properties: {
    "speciesId": {
      type: "string",
    },
    "excluded": { type: "boolean" },
  },
  "required": ["observationGroupId", "speciesId"],
  "additionalProperties": false
} as const;

export {
  ObservationGroupSpeciesSchema,
  ObservationGroupSpeciesRequestSchema,
};

