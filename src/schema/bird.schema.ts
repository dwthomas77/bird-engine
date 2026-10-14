import { schemaId } from "./ids.js";
const requiredFields = [
  'birdId',
  'speciesId',
  'taxonId',
  'speciesName',
  'localeName',
  'genusId',
  'familyId',
] as const;

const baseBirdProperties = {
  birdId: {
    type: "string",
  },
  speciesId: {
    type: "string",
  },
  taxonId: {
    type: "string",
  },
  speciesName: {
    type: "string",
  },
  localeName: {
    type: "string",
  },
  genusId: {
    type: "string",
  },
  familyId: {
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
  $id: schemaId("bird"),
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
