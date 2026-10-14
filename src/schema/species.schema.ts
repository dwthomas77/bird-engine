import { schemaId, schemaRef } from "./ids.js";
const requiredFields = [
  "taxonId",
  "speciesName",
  "genusId",
  "familyId",
  "localeName",
  "lengthMin",
  "lengthMax",
  "weightMin",
  "weightMax",
  "wingspanMin",
  "wingspanMax",
] as const;

const baseSpeciesProperties = {
  taxonId: {
    type: "string",
  },
  speciesName: {
    type: "string",
  },
  genusId: {
    type: "string",
  },
  familyId: {
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
    ...baseSpeciesProperties,
  },
  required: [...requiredFields, "speciesId"],
} as const;

const SpeciesRequestSchema = {
  $id: schemaId("species/request"),
  title: "Species Request",
  description: "A request to update or create a species of bird",
  type: "object",
  properties: {
    ...baseSpeciesProperties,
    habitats: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [...requiredFields, "habitats"],
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
    ...baseSpeciesProperties,
    habitats: {
      type: "array",
      items: {
        $ref: schemaRef("habitat"),
      },
    },
  },
  required: [...requiredFields, "speciesId", "habitats"],
} as const;

export {
  SpeciesSchema,
  SpeciesRequestSchema,
  SpeciesReadSchema,
};
