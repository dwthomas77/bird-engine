import { schemaId } from "./ids.js";

export const ObservationGroupGenusSchema = {
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
