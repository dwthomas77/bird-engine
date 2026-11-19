import { schemaId } from "./ids.js";

const ObservationGroupGenusSchema = {
  $id: schemaId("observation-group-genus"),
  title: "Observation Group - Genus",
  description: "A relationship between an Observation Group and a Genus",
  type: "object",
  properties: {
    observationGroupId: { type: "string" },
    genusId: { type: "string" },
    excluded: { type: "boolean" },
  },
  required: ["observationGroupId", "genusId"],
  additionalProperties: false,
} as const;

const ObservationGroupGenusRequestSchema = {
  $id: schemaId("observationGroup/genus/request"),
  title: "Observation Group - Genus Request",
  description: "A request to create or update a relationship between an Observation Group and a Genus",
  type: "object",
  properties: {
    genusId: { type: "string" },
    excluded: { type: "boolean" },
  },
  required: ["genusId"],
  additionalProperties: false,
} as const;

export { ObservationGroupGenusSchema, ObservationGroupGenusRequestSchema };
