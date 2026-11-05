import { schemaId } from "./ids.js";
const requiredFields = [
  "name"
] as const;

const baseObservationGroupProperties = {
  name: {
    type: "string",
  },
  parentId: {
    type: "string",
  },
} as const;

const ObservationGroupSchema = {
  $id: schemaId("observationGroup"),
  title: "Bird Observation Group",
  description: "An abstract representation of a group of related birds",
  type: "object",
  properties: {
    observationGroupId: {
      type: "string",
    },
    ...baseObservationGroupProperties,
  },
  required: [...requiredFields, "observationGroupId"],
} as const;

const ObservationGroupRequestSchema = {
  $id: schemaId("observationGroup/request"),
  title: "Bird Observation Group",
  description: "An abstract representation of a group of related birds",
  type: "object",
  properties: {
    ...baseObservationGroupProperties,
  },
  required: [...requiredFields],
} as const;

export { ObservationGroupSchema, ObservationGroupRequestSchema };