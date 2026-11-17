import { schemaId } from "./ids.js";

export const ObservationGroupFamilySchema = {
  $id: schemaId("observation-group-family"),
  title: "Observation Group - Family",
  description: "A relationship between an Observation Group and a Family",
  type: "object",
  properties: {
    observationGroupId: { type: "string" },
    familyId: { type: "string" },
    excluded: { type: "boolean" },
  },
  required: ["observationGroupId", "familyId"],
  additionalProperties: false,
} as const;
