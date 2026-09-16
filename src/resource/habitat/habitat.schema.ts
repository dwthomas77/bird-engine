const schema = {
  $id: "api/habitat",
  title: "Habitat",
  description: "A habitat for birds",
  type: "object",
  properties: {
    "habitatId": {
      type: "string",
    },
    "habitatName": {
      type: "string",
    },
    "habitatDescription": {
      type: "string",
    },
  },
  "required": ["habitatId", "habitatName", "habitatDescription"]
} as const;

export default schema;
