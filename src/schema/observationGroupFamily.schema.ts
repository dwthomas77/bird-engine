import { schemaId } from "./ids.js";

const ObservationGroupFamilySchema = {
  $id: schemaId("observationGroup/family"),
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

const ObservationGroupFamilyRequestSchema = {
  $id: schemaId("observationGroup/family/request"),
  title: "Observation Group - Family Request",
  description: "A request to create or update a relationship between an Observation Group and a Family",
  type: "object",
  properties: {
    familyId: { type: "string" },
    excluded: { type: "boolean" },
  },
  required: ["familyId"],
  additionalProperties: false,
} as const;

export { ObservationGroupFamilySchema, ObservationGroupFamilyRequestSchema };