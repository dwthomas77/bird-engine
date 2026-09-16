const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "serverErrorResponse",
  title: "Server Error Response",
  description: "Error response format for 400+ level errors",
  type: "object",
  properties: {
    "status": {
      type: "number",
    },
    "error": {
      type: "string",
    },
    "message": {
      type: "string",
    },
  },
  "required": ["status", "error", "message"]
} as const;

export default schema;
