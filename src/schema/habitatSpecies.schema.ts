export const HabitatSpeciesSchema = {
  $id: "api/habitat-species",
  title: "Habitat - Species",
  description: "A relationship between a Habitat and a Species",
  type: "object",
  properties: {
    "habitatId": {
      type: "string",
    },
    "speciesId": {
      type: "string",
    },
  },
  "required": ["habitatId", "speciesId"],
  "additionalProperties": false
} as const;