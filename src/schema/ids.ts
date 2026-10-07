export const SCHEMA_BASE_URL = "https://bird-engine.local/api" as const;

export const schemaId = <const T extends string>(name: T) =>
  `${SCHEMA_BASE_URL}/${name}` as `${typeof SCHEMA_BASE_URL}/${T}`;

export const schemaRef = <const T extends string>(name: T) =>
  `${SCHEMA_BASE_URL}/${name}#` as `${typeof SCHEMA_BASE_URL}/${T}#`;
