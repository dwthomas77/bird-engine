import { schemaId } from "./ids.js";
export const LocationSchema = {
  "$id": schemaId("location"),
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "habitatId": {
      "type": "string"
    }
  },
  "required": ["name", "habitatId"]
} as const;