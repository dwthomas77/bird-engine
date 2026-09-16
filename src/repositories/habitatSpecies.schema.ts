const HabitatSpeciesSchema = {
  $id: "habitat-species",
  title: "Habitat species relationship",
  description: "A relationship between one habitat and one species",
  type: "object",
  properties: {
    habitatId: {
      type: "string",
    },
    speciesId: {
      type: "string",
    },
  },
  required: ["habitatId", "speciesId"],
  additionalProperties: false,
} as const;

export default HabitatSpeciesSchema;