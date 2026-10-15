import { schemaId, schemaRef } from "./ids.js";
const requiredFields = [
  "speciesName",
  "localeName",
  "lengthMin",
  "lengthMax",
  "weightMin",
  "weightMax",
  "wingspanMin",
  "wingspanMax",
] as const;

const baseSpeciesProperties = {
  speciesName: {
    type: "string",
  },
  localeName: { type: "string" },
  lengthMin: { type: "number" },
  lengthMax: { type: "number" },
  weightMin: { type: "number" },
  weightMax: { type: "number" },
  wingspanMin: { type: "number" },
  wingspanMax: { type: "number" },
} as const;

const SpeciesSchema = {
  $id: schemaId("species"),
  title: "Species",
  description: "A species of bird",
  type: "object",
  properties: {
    speciesId: {
      type: "string",
    },
    genusId: {
      type: "string",
    },
    ...baseSpeciesProperties,
  },
  required: [...requiredFields, "speciesId", "genusId"],
} as const;

const SpeciesRequestSchema = {
  $id: schemaId("species/request"),
  title: "Species Request",
  description: "A request to update or create a species of bird",
  type: "object",
  properties: {
    ...baseSpeciesProperties,
      genusId: {
    type: "string",
  },
    habitats: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [...requiredFields, "genusId", "habitats"],
} as const;

const SpeciesReadSchema = {
  $id: schemaId("species/read"),
  title: "Detailed Species",
  description: "A species of bird",
  type: "object",
  properties: {
    speciesId: {
      type: "string",
    },
      genusId: {
    type: "string",
  },
    ...baseSpeciesProperties,
    habitats: {
      type: "array",
      items: {
        $ref: schemaRef("habitat"),
      },
    },
  },
  required: [...requiredFields, "speciesId", "genusId", "habitats"],
} as const;

const SpeciesSummarySchema = {
  $id: schemaId("species/summary"),
  title: "Species Summary",
  description: "A species of bird",
  type: "object",
  properties: {
    speciesId: {
      type: "string",
    },
    family: {
      type: "object",
      properties: {
        familyId: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
      required: ["familyId", "name"],
    },
    genus: {
      type: "object",
      properties: {
        genusId: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
      required: ["genusId", "name"],
    },
    ...baseSpeciesProperties,
    habitats: {
      type: "array",
      items: {
        $ref: schemaRef("habitat"),
      },
    },
  },
  required: [...requiredFields, "speciesId", "genus", "family", "habitats"],
} as const;

export {
  SpeciesSchema,
  SpeciesRequestSchema,
  SpeciesReadSchema,
  SpeciesSummarySchema,
};
