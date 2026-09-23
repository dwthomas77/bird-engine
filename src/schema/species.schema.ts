const requiredFields = [
  "speciesName",
  "family",
  "genus",
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
  family: {
    type: "string",
  },
  genus: {
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
  $id: "api/species",
  title: "Species",
  description: "A species of bird",
  type: "object",
  properties: {
    speciesId: {
      type: "string",
    },
    ...baseSpeciesProperties,
  },
  required: [...requiredFields, "habitatId", "habitats"],
} as const;

const SpeciesRequestSchema = {
  $id: "api/species/request",
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
  $id: "api/species/read",
  title: "Species Read",
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
        $ref: "api/habitat#",
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
