import { schemaId } from "./ids.js";
const requiredFields = ["name"] as const;

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
    families: {
      type: "array",
      items: {
        type: "object",
        properties: {
          familyId: { type: "string" },
          excluded: { type: "boolean" },
        },
        required: ["familyId"],
        additionalProperties: false,
      },
    },
    genera: {
      type: "array",
      items: {
        type: "object",
        properties: {
          genusId: { type: "string" },
          excluded: { type: "boolean" },
        },
        required: ["genusId"],
        additionalProperties: false,
      },
    },
    species: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speciesId: { type: "string" },
          excluded: { type: "boolean" },
        },
        required: ["speciesId"],
        additionalProperties: false,
      },
    },
  },
  required: [...requiredFields],
} as const;

const ObservationGroupSummarySchema = {
  $id: schemaId("observationGroup/summary"),
  title: "Bird Observation Group",
  description: "An abstract representation of a group of related birds",
  type: "object",
  properties: {
    observationGroupId: {
      type: "string",
    },
    ...baseObservationGroupProperties,
families: {
  type: "array",
  items: {
    type: "object",
    properties: {
      observationGroupId: {
        type: "string",
      },
      familyId: {
        type: "string",
      },
      excluded: {
        type: "boolean",
      },
    },
    required: ["observationGroupId", "familyId"],
    additionalProperties: false,
  },
},
    genera: {
      type: "array",
      items: {
        type: "object",
        properties: {
          observationGroupId: {
            type: "string",
          },
          genusId: {
            type: "string",
          },
          excluded: {
            type: "boolean",
          },
        },
        required: ["observationGroupId", "genusId"],
        additionalProperties: false,
      },
    },
    species: {
      type: "array",
      items: {
        type: "object",
        properties: {
          observationGroupId: {
            type: "string",
          },
          speciesId: {
            type: "string",
          },
          excluded: {
            type: "boolean",
          },
        },
        required: ["observationGroupId", "speciesId"],
        additionalProperties: false,
      },
    },
  },
  required: [...requiredFields, "observationGroupId", "families", "genera", "species"],
} as const;

export {
  ObservationGroupSchema,
  ObservationGroupRequestSchema,
  ObservationGroupSummarySchema,
};
