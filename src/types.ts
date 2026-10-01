import { FromSchema } from "json-schema-to-ts";
import { HabitatSchema, HabitatRequestSchema} from './schema/habitat.schema.js';
import { HabitatSpeciesSchema } from './schema/habitatSpecies.schema.js';
import { BirdSchema } from './schema/bird.schema.js';
import { SpeciesSchema, SpeciesRequestSchema } from './schema/species.schema.js';
import { UserSchema, UserRequestSchema } from './schema/user.schema.js';
import { ObservationSchema, ObservationRequestSchema } from './schema/observation.schema.js';
import { JournalSchema, JournalRequestSchema } from './schema/journal.schema.js';
import { LocationSchema } from './schema/location.schema.js';
import ServerErrorResponseSchema from './schema/server.errorResponse.schema.js';

export type Bird = FromSchema<typeof BirdSchema>;
export type User = FromSchema<typeof UserSchema>;
export type UserRequest = FromSchema<typeof UserRequestSchema>;
export type Habitat = FromSchema<typeof HabitatSchema>;
export type HabitatRequest= FromSchema<typeof HabitatRequestSchema>;
export type Species = FromSchema<typeof SpeciesSchema>;
export type SpeciesRead = Omit<Species, "habitats"> & { habitats: Habitat[] };
export type SpeciesRequest = FromSchema<typeof SpeciesRequestSchema>;
export type HabitatSpecies = FromSchema<typeof HabitatSpeciesSchema>;
export type HabitatSpeciesRelationship = HabitatSpecies;
export type Observation = FromSchema<
  Omit<typeof ObservationSchema, "$schema">,
  { references: [typeof LocationSchema] }
>;
export type ObservationRequest = FromSchema<
  Omit<typeof ObservationRequestSchema, "$schema">,
  { references: [typeof LocationSchema] }
>;
export type Journal = FromSchema<typeof JournalSchema>;
export type JournalRequest = FromSchema<typeof JournalRequestSchema>;
export type ServerErrorResponse = FromSchema<typeof ServerErrorResponseSchema>;