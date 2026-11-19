import { FromSchema } from "json-schema-to-ts";
import { HabitatSchema, HabitatRequestSchema} from './schema/habitat.schema.js';
import { HabitatSpeciesSchema } from './schema/habitatSpecies.schema.js';
import { BirdSchema } from './schema/bird.schema.js';
import { SpeciesSchema, SpeciesRequestSchema, SpeciesSummarySchema } from './schema/species.schema.js';
import { UserSchema, UserRequestSchema } from './schema/user.schema.js';
import { ObservationSchema, ObservationRequestSchema } from './schema/observation.schema.js';
import { JournalSchema, JournalRequestSchema, JournalSummarySchema } from './schema/journal.schema.js';
import { ObservationGroupSchema, ObservationGroupRequestSchema, ObservationGroupSummarySchema } from './schema/observationGroup.schema.js';
import { ObservationGroupFamilySchema, ObservationGroupFamilyRequestSchema } from './schema/observationGroupFamily.schema.js';
import { ObservationGroupGenusSchema, ObservationGroupGenusRequestSchema } from './schema/observationGroupGenus.schema.js';
import { ObservationGroupSpeciesSchema } from './schema/observationGroupSpecies.schema.js';
import { LocationSchema } from './schema/location.schema.js';
import ServerErrorResponseSchema from './schema/server.errorResponse.schema.js';

export type Bird = FromSchema<typeof BirdSchema>;
export type User = FromSchema<typeof UserSchema>;
export type UserRequest = FromSchema<typeof UserRequestSchema>;
export type Habitat = FromSchema<typeof HabitatSchema>;
export type HabitatRequest= FromSchema<typeof HabitatRequestSchema>;
export type Species = FromSchema<typeof SpeciesSchema>;
export type SpeciesRead = Omit<Species, "habitats"> & { habitats: Habitat[] };
export type SpeciesSummary = Omit<FromSchema<typeof SpeciesSummarySchema>, "habitats"> & { habitats: Habitat[] };
export type SpeciesRequest = FromSchema<typeof SpeciesRequestSchema>;
export type HabitatSpecies = FromSchema<typeof HabitatSpeciesSchema>;
export type HabitatSpeciesRelationship = HabitatSpecies;
export type Observation = FromSchema<
  typeof ObservationSchema,
  { references: [typeof LocationSchema, typeof BirdSchema] }
>;
export type ObservationRequest = FromSchema<
  typeof ObservationRequestSchema,
  { references: [typeof LocationSchema, typeof BirdSchema] }
>;
export type ObservationGroup = FromSchema<typeof ObservationGroupSchema>;
export type ObservationGroupRequest = FromSchema<typeof ObservationGroupRequestSchema>;
export type ObservationGroupSummary = FromSchema<typeof ObservationGroupSummarySchema>;
export type ObservationGroupFamily = FromSchema<typeof ObservationGroupFamilySchema>;
export type ObservationGroupFamilyRequest = FromSchema<typeof ObservationGroupFamilyRequestSchema>;
export type ObservationGroupGenus = FromSchema<typeof ObservationGroupGenusSchema>;
export type ObservationGroupGenusRequest = FromSchema<typeof ObservationGroupGenusRequestSchema>;
export type ObservationGroupSpecies = FromSchema<typeof ObservationGroupSpeciesSchema>;
export type Journal = FromSchema<typeof JournalSchema>;
export type JournalRequest = FromSchema<typeof JournalRequestSchema>;
export type JournalSummary = FromSchema<typeof JournalSummarySchema>;
export type ServerErrorResponse = FromSchema<typeof ServerErrorResponseSchema>;

export interface Taxon {
  taxonId: string;
  rank: string;
  name: string;
}
export interface TaxonGenus extends Taxon {
  familyId: string;
}
export interface TaxonSpecies extends Taxon {
  scientificName: string;
  genusId: string;
  familyId: string;
}
export interface TaxonData {
  families: Taxon[];
  genera: TaxonGenus[];
  species: TaxonSpecies[];
}
