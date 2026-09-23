import { FromSchema } from "json-schema-to-ts";
import { HabitatSchema, HabitatRequestSchema} from './schema/habitat.schema.js';
import { SpeciesSchema, SpeciesRequestSchema, SpeciesReadSchema } from './schema/species.schema.js';
import ServerErrorResponseSchema from './schema/server.errorResponse.schema.js';

export type Habitat = FromSchema<typeof HabitatSchema>;
export type HabitatRequest= FromSchema<typeof HabitatRequestSchema>;
export type Species = FromSchema<typeof SpeciesSchema>;
export type SpeciesRead = FromSchema<typeof SpeciesReadSchema>;
export type SpeciesRequest = FromSchema<typeof SpeciesRequestSchema>;
export type ServerErrorResponse = FromSchema<typeof ServerErrorResponseSchema>;