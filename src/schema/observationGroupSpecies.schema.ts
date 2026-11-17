import { schemaId } from "./ids.js";
export const ObservationGroupSpeciesSchema = {
  $id: schemaId("observation-group-species"),
  title: "Observation Group - Species",
  description: "A relationship between an Observation Group and a Species",
  type: "object",
  properties: {
    "observationGroupId": {
      type: "string",
    },
    "speciesId": {
      type: "string",
    },
  },
  "required": ["observationGroupId", "speciesId"],
  "additionalProperties": false
} as const;