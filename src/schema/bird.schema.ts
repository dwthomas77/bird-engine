const requiredFields = [
  'birdId',
  'speciesId',
  'speciesName',
  'localeName',
  'genus',
  'family',
] as const;

const baseBirdProperties = {
  birdId: {
    type: "string",
  },
  speciesId: {
    type: "string",
  },
  speciesName: {
    type: "string",
  },
  localeName: {
    type: "string",
  },
  genus: {
    type: "string",
  },
  family: {
    type: "string",
  },
  sex: {
    type: "string",
    enum: ["male", "female"],
  },
  length: {
    type: "number",
  },
  weight: {
    type: "number",
  },
  wingspan: {
    type: "number",
  },
} as const;

const BirdSchema = {
  $id: "api/bird",
  title: "Bird",
  description: "A bird",
  type: "object",
  properties: {
    ...baseBirdProperties,
  },
  required: [...requiredFields],
} as const;

export {
  BirdSchema,
};
