import { FromSchema } from "json-schema-to-ts";
import HabitatSchema from './resource/habitat/habitat.schema.js';
import { SpeciesEntity as SpeciesEntitySchema, CreateSpeciesSchema, ReadSpeciesSchema } from './resource/species/species.schema.js';
import ServerErrorResponseSchema from './schema/server.errorResponse.schema.js';

export type Habitat = FromSchema<typeof HabitatSchema>;
export type SpeciesEntity = FromSchema<typeof SpeciesEntitySchema>;
export type ReadSpecies = FromSchema<typeof ReadSpeciesSchema>;
export type CreateSpecies = FromSchema<typeof CreateSpeciesSchema>;
export type ServerErrorResponse = FromSchema<typeof ServerErrorResponseSchema>;