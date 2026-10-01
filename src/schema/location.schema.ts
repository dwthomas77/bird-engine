export const LocationSchema = {
  "$id": "https://bird-engine.local/api/location",
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